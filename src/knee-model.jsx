import React from 'react';
import ReactDOM from 'react-dom';
import React3 from 'react-three-renderer';
window.THREE = require('three');    // trick to make THREE global so STLLoader can see it (used when loading a non-npm module extending existing one)

import TrackballControls from './trackball';
import Stats from 'stats.js';
var STLLoader = require('./STLLoader');

/*

Possible add-ons:
- second scene with AxisHelper showing current rotation (http://stackoverflow.com/questions/16226693/three-js-show-world-coordinate-axes-in-corner-of-scene)

*/

/*

NOTE:

When setting initial renderer width and height to 0, the control "change" event
is no triggered. In order to adjust for the window resize if happening,
controls.handleResize() should be called inside that event callback. One
possible solution is to not initialize to 0 both height and width, but to
something different. In this case, you would notice that controls.handleResize()
inside the change event callback would fix the control after resizing, but not
immediately. The best solution seems to add controls.handleResize() just before
the corresponding update in the animation function, if a resized flag was set to
true. This also decorrelated the problem with the initialization of width and
height.

*/


class KneeModel extends React.Component {

    static propTypes = {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
    };


    constructor(props, context) {

        super(props, context);

        this.loader = new THREE.STLLoader();

        this.state = {
            refresh: false,
            femurFileLoaded: false,
            tibiaFileLoaded: false,
            cameraPosition: new THREE.Vector3(...this.props.initCameraPosition)
        }

        this.resized = false;

    }

    //_createMeshFromLoadedGeometry = (geometry) => {
    _createMeshFromLoadedGeometry(geometry) {

        //var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        //var material = new THREE.MeshPhongMaterial({color: 0x757247});
        //var material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 30 } );
        var material = new THREE.MeshLambertMaterial( { color: 0xe1c058 } );

        var mesh = new THREE.Mesh(geometry, material);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;

    }


    _onLoadFemur = (geometry) => {

        this.femur = this._createMeshFromLoadedGeometry(geometry);
        this.refs.lab.add(this.femur);
        this.setState({femurFileLoaded: true});

    }


    _onLoadTibia = (geometry) => {

        this.tibia = this._createMeshFromLoadedGeometry(geometry);
        this.refs.lab.add(this.tibia);
        this.setState({tibiaFileLoaded: true});

    }


    _loadFemurFile = (file) => {

        this.refs.lab.remove(this.femur);
        this.loader.load(file, this._onLoadFemur);
        this.setState({femurFileLoaded: false});

    }


    _loadTibiaFile = (file) => {

        this.refs.lab.remove(this.tibia);
        this.loader.load(file, this._onLoadTibia);
        this.setState({tibiaFileLoaded: false});

    }


    _updateFemur = () => {

        this.femur.visible = this.props.showFemur;

        this.femur.matrix.set(...this.props.femurToLabPose);
        this.femur.matrixAutoUpdate = false;

    }


    _updateTibia = () => {

        this.tibia.visible = this.props.showTibia;

        this.tibia.matrix.set(...this.props.tibiaToLabPose);
        this.tibia.matrixAutoUpdate = false;

    }


    _updateLab = () => {

        this.refs.lab.matrix.set(...this.props.screenToLabPose);
        this.refs.lab.matrixAutoUpdate = false;

    }


    _onAnimate = () => {

        if (this.state.femurFileLoaded) {
            this._updateFemur();
        }

        if (this.state.tibiaFileLoaded) {
            this._updateTibia();
        }

        this._updateLab();

        if (this.resized) {
            this.controls.handleResize();
            this.resized = false;
        }
        this.controls.update();

        this.stats.update();

    };


    _onControlsChange = () => {

        this.setState({
            cameraPosition: this.refs.camera.position,
        });

    }


    componentDidMount() {

        // Add mouse trackball control
        const controls = new TrackballControls(this.refs.camera,
        ReactDOM.findDOMNode(this.refs.react3));

        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        controls.target = new THREE.Vector3(...this.props.initCameraLookAt);

        controls.addEventListener('change', this._onControlsChange);

        this.controls = controls;

        // Add stats panel
        this.stats = new Stats();

        this.refs.container.style.position = 'relative';
        this.refs.container.appendChild(this.stats.domElement);

        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';

        // Add hemisphere light (not yet wrapped in react-three-renderer)
        this.refs.scene.add(new THREE.HemisphereLight(0xffffff, 0x111122));

        // Add ground
        /*
        var ground = new THREE.Mesh(
        	new THREE.PlaneBufferGeometry(1000, 1000),
        	new THREE.MeshPhongMaterial({color: 0x999999, specular: 0x101010})
        );
        ground.receiveShadow = true;
        this.refs.lab.add(ground);
        */
        var ground = new THREE.GridHelper(1000, 21);
        ground.rotation.x = Math.PI / 2;  // default is on XZ plane, so rotation needed
        this.refs.lab.add(ground);

        // Load femur
        this._loadFemurFile(this.props.femurFile);

        // Load tibia
        this._loadTibiaFile(this.props.tibiaFile);

    }


    componentWillUnmount() {

        this.controls.dispose();
        delete this.controls;
        delete this.stats;

    }


    componentWillUpdate(nextProps, nextState) {

        if (nextProps.width != this.props.width || nextProps.height != this.props.height) {
            this.resized = true;
        }

        if (nextProps.femurFile != this.props.femurFile) {
            if (nextProps.femurFile != '') {
                this._loadFemurFile(nextProps.femurFile);
            }
        }

        if (nextProps.tibiaFile != this.props.tibiaFile) {
            if (nextProps.tibiaFile != '') {
                this._loadTibiaFile(nextProps.tibiaFile);
            }
        }

    }


    render() {

        const {
            width,
            height,
            pixelRatio,
        } = this.props;

        return (<div ref="container">
            <React3
                ref="react3"
                mainCamera="camera"
                width={width}
                height={height}
                antialias
                pixelRatio={pixelRatio}
                onAnimate={this._onAnimate}
                onRendererUpdated={this._onRendererUpdated}
            >
                <scene ref="scene">
                    <perspectiveCamera
                        ref="camera"
                        name="camera"
                        fov={75}
                        aspect={width / height}
                        near={0.1}
                        far={5000}
                        position={this.state.cameraPosition}
                    />
                    <object3D ref="lab">
                        <axisHelper
                            size={75}
                        />
                    </object3D>
                </scene>
            </React3>
        </div>);
    }

}


export default KneeModel;
