import React from 'react';
import ReactDOM from 'react-dom';
import React3 from 'react-three-renderer';
window.THREE = require('three');    // trick to make THREE global so STLLoader can see it (used when loading a non-npm module extending existing one)

import TrackballControls from './trackball';
import Stats from 'stats.js';
var STLLoader = require('./STLLoader');
var MeshLine = require('three.meshline').MeshLine;
var MeshLineMaterial = require('three.meshline').MeshLineMaterial;
import _ from 'lodash';


// Set default props variable

var eyePose = [
    1,  0,  0,  0,
    0,  1,  0,  0,
    0,  0,  1,  0,
    0,  0,  0,  1
];

var nullPosition = [null, null, null];

var defScreenToLabPose = [
    1,  0,  0,  0,
    0,  0,  1,  0,
    0, -1,  0,  0,
    0,  0,  0,  1
];

var defInitCameraPosition = [0, 300, 500];   // in screen coordinate system

var defInitCameraLookAt = [0, 300, 200];     // in screen coordinate system

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

    static defaultProps = {
        width: 300,
        height: 300,
        pixelRatio: 1,
        femurFile: '',
        tibiaFile: '',
        patellaFile: '',
        femurToLabPose: eyePose,
        tibiaToLabPose: eyePose,
        petellaToLabPose: eyePose,
        //SMCLPath: [nullPosition, nullPosition],
        ligaments: [],
        points: [],
        showFemur: true,
        showTibia: true,
        showPatella: true,
        //showSMCL: true,
        screenToLabPose: defScreenToLabPose,
        initCameraPosition: defInitCameraPosition,
        initCameraLookAt: defInitCameraLookAt,
    };

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
            patellaFileLoaded: false,
            cameraPosition: new THREE.Vector3(...this.props.initCameraPosition)
        }

        this.resized = false;

    }


    _createMeshBoneFromLoadedGeometry(geometry) {

        var material = new THREE.MeshLambertMaterial({color: 0xe1c058});

        var mesh = new THREE.Mesh(geometry, material);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;

    }


    _createMeshLigament = (label, color, width) => {

        var geometry = new THREE.Geometry();
        geometry.vertices = [
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
        ];
        var meshLine = new MeshLine();
        meshLine.setGeometry(geometry);

        var resolution = new THREE.Vector2(this.props.width, this.props.height);
        var material = new MeshLineMaterial({
            useMap: false,
            color: new THREE.Color(color),
            opacity: 1,
            resolution: resolution,
            sizeAttenuation: !false,
            lineWidth: width,
        });

        var mesh = new THREE.Mesh(meshLine.geometry, material);
        mesh.userData.resolution = resolution;
        mesh.userData.origMeshLine = meshLine;
        mesh.userData.origGeometry = geometry;
        mesh.userData.Nv = geometry.vertices.length;
        mesh.userData.label = label;
        mesh.userData.setPath = function(p) {
            let geometry = this.userData.origGeometry;
            let meshLine = this.userData.origMeshLine;
            let vertices = [];
            for (var i = 0; i < p.length; i++) {
                vertices.push(new THREE.Vector3(...p[i]));
            }
            if (vertices.length == 0) vertices.push(new THREE.Vector3());
            let last = vertices.splice(-1)[0];
            for (var i = p.length; i < this.userData.Nv; i++) {
                vertices.push(last);
            }
            geometry.vertices = vertices;
            meshLine.setGeometry(geometry);
            if (p.length < 2) {
                this.visible = false;
            }
        }.bind(mesh);

        return mesh;

    }


    _makeLigaments = () => {

        this.ligaments = new THREE.Group();
        for (var p of this.props.ligaments) {
            var meshLiga = this._createMeshLigament(p.label, p.color, p.width);
            this.ligaments.add(meshLiga);
        }
        this.refs.lab.add(this.ligaments);

    }

    _makePoints = () => {

        this.points = new THREE.Group();
        for (var p of this.props.points) {
            var meshPoint = this._createMeshPoint(p.label, p.color, p.radius, p.pos);
            this.points.add(meshPoint);
        }
        this.refs.lab.add(this.points);

    }


    _createMeshPoint = (label, color, radius, pos) => {

        var geometry = new THREE.SphereGeometry(radius, 32, 32);
        var material = new THREE.MeshBasicMaterial({color: color});
        var mesh = new THREE.Mesh(geometry, material);
        mesh.userData.label = label;
        return mesh;

    }


    _removePoints = () => {

        this.refs.lab.remove(this.points);

    }


    _onLoadFemur = (geometry) => {

        this.femur = this._createMeshBoneFromLoadedGeometry(geometry);
        this.refs.lab.add(this.femur);
        this.setState({femurFileLoaded: true});

    }


    _onLoadTibia = (geometry) => {

        this.tibia = this._createMeshBoneFromLoadedGeometry(geometry);
        this.refs.lab.add(this.tibia);
        this.setState({tibiaFileLoaded: true});

    }


    _onLoadPatella = (geometry) => {

        this.patella = this._createMeshBoneFromLoadedGeometry(geometry);
        this.refs.lab.add(this.patella);
        this.setState({patellaFileLoaded: true});

    }


    _loadFemurFile = (file) => {

        this.refs.lab.remove(this.femur);
        this.loader.load(file, this._onLoadFemur);

    }


    _loadTibiaFile = (file) => {

        this.refs.lab.remove(this.tibia);
        this.loader.load(file, this._onLoadTibia);

    }


    _loadPatellaFile = (file) => {

        this.refs.lab.remove(this.patella);
        this.loader.load(file, this._onLoadPatella);

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


    _updatePatella = () => {

        this.patella.visible = this.props.showPatella;

        this.patella.matrix.set(...this.props.patellaToLabPose);
        this.patella.matrixAutoUpdate = false;

    }


    _updateLigaments = () => {

        // Update existing ligaments, or create new ones
        for (var p of this.props.ligaments) {
            var mesh = _.find(this.ligaments.children, (m) => { return m.userData.label == p.label; });
            if (mesh) {
                mesh.visible = true;
                mesh.userData.setPath(p.path)
                mesh.material.uniforms.color.value.setHex(p.color);
                if (this.resized) {
                    mesh.userData.resolution.set(this.props.width, this.props.height);
                }
            } else {
                var meshLiga = this._createMeshLigament(p.label, p.color, p.width);
                meshLiga.userData.setPath(p.path)
                this.ligaments.add(meshLiga);
            }
        }
        // Hide unexisting ligaments (much less expensive than removing them)
        for (var c of this.ligaments.children) {
            var p = _.find(this.props.ligaments, {label: c.userData.label});
            if (!p) {
                c.visible = false;
            }
        }

    }


    _updatePoints = () => {

        // Update existing points, or create new ones
        for (var p of this.props.points) {
            var mesh = _.find(this.points.children, (m) => { return m.userData.label == p.label; });
            if (mesh) {
                mesh.position.set(...p.pos);
                mesh.material.color.setHex(p.color);
            } else {
                var meshPoint = this._createMeshPoint(p.label, p.color, p.radius, p.pos);
                this.points.add(meshPoint);
            }
        }
        // Hide unexisting points (much less expensive than removing them)
        for (var c of this.points.children) {
            var p = _.find(this.props.points, {label: c.userData.label});
            if (!p) {
                c.position.set(undefined, undefined, undefined);
            }
        }

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

        if (this.state.patellaFileLoaded) {
            this._updatePatella();
        }

        this._updateLigaments();

        this._updateLab();

        this._updatePoints();

        if (this.resized) {
            this.controls.handleResize();
            this.resized = false;   // only after the mesh updates
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
        var ground = new THREE.GridHelper(1000, 21);
        ground.rotation.x = Math.PI / 2;  // default is on XZ plane, so rotation needed
        this.refs.lab.add(ground);

        // Load femur
        this._loadFemurFile(this.props.femurFile);

        // Load tibia
        this._loadTibiaFile(this.props.tibiaFile);

        // Load patella
        this._loadPatellaFile(this.props.patellaFile);

        // Make ligaments
        this._makeLigaments();

        // Make points
        this._makePoints();

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

        if (nextProps.patellaFile != this.props.patellaFile) {
            if (nextProps.patellaFile != '') {
                this._loadPatellaFile(nextProps.patellaFile);
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
