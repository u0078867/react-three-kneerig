
import React from 'react';
import KneeModel from '../../src/knee-model';

/*

NOTE:

- screen coordinate system is normally: x right, y up, z out of screen towards user
- here lab coordinate system is created by rotating the screen one around its x axis by -90 deg

*/

var femurToLabPose = [
    1,  0,  0,  0,
    0,  1,  0,  0,
    0,  0,  1,  0,
    0,  0,  0,  1
];

var tibiaToLabPose = [
    1,  0,  0,  0,
    0,  1,  0,  0,
    0,  0,  1,  0,
    0,  0,  0,  1
];

var patellaToLabPose = [
    1,  0,  0,  0,
    0,  1,  0,  0,
    0,  0,  1,  0,
    0,  0,  0,  1
];

var screenToLabPose = [
    1,  0,  0,  0,
    0,  0,  1,  0,
    0, -1,  0,  0,
    0,  0,  0,  1
];

/*var initCameraPosition = [130, 600, 800];   // in screen coordinate system

var initCameraLookAt = [130, 600, 200];     // in screen coordinate system
*/
var initCameraPosition = [0, 300, 500];   // in screen coordinate system

var initCameraLookAt = [0, 300, 200];     // in screen coordinate system


class Container extends React.Component {

    constructor(props, context) {

        super(props, context);

        this.state = {
            viewerWidth: 0,
            viewerHeight: 0,
        }

    }


    componentDidMount() {

        window.addEventListener('resize', this._onWindowResize, false);
        this._onWindowResize();

    }


    componentWillUnmount() {

        window.removeEventListener('resize', this._onWindowResize, false);

    }


    _onWindowResize = () => {

        const viewer = this.refs.viewer;
        this.setState({
            viewerWidth: viewer.offsetWidth,
            viewerHeight: viewer.offsetHeight,
        });

    };

    render() {

        return <div>
            Here is the example:
            <div ref="viewer" style={{height: "80vh", width: "80vw"}}>
            {/*<div ref="viewer" style={{height: "50%", width: "50%"}}>*/}
            {/*<div ref="viewer" style={{height: "500px", width: "500px"}}>}*/}
                <KneeModel
                    width={this.state.viewerWidth}
                    height={this.state.viewerHeight}
                    pixelRatio={window.devicePixelRatio}

                    femurFile={'./femur_bin.stl'}
                    tibiaFile={'./tibia_bin.stl'}
                    patellaFile={'./patella_bin.stl'}

                    femurToLabPose={femurToLabPose}
                    tibiaToLabPose={tibiaToLabPose}
                    patellaToLabPose={patellaToLabPose}

                    showFemur={true}
                    showTibia={true}
                    showPatella={true}

                    screenToLabPose={screenToLabPose}

                    initCameraPosition={initCameraPosition}
                    initCameraLookAt={initCameraLookAt}
                />
            </div>
        </div>

    }

}


export default Container;
