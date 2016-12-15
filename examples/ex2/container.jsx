
import React from 'react';
import {KneeModel} from 'react-three-kneerig';

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

var tibiaToLabPosePert = tibiaToLabPose.slice(0);

var SMCLFemurInsertionPosition = [49.2056, -103.7274, 256.3688]

var SMCLTibiaInsertionPosition = [21.1704, -108.4569, 176.2609];

var SMCLTibiaInsertionPositionPert = SMCLTibiaInsertionPosition.slice(0);

var screenToLabPose = [
    1,  0,  0,  0,
    0,  0,  1,  0,
    0, -1,  0,  0,
    0,  0,  0,  1
];

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
        this.th = setInterval(this._applyRandomMotion, 500);

    }


    componentWillUnmount() {

        window.removeEventListener('resize', this._onWindowResize, false);
        clearInterval(this.th);

    }


    _applyRandomMotion = () => {
        // Move tibia around randomly of max 5 mm
        var dx = Math.random() * 10 - 5;
        var dy = Math.random() * 10 - 5;
        var dz = Math.random() * 10 - 5;
        tibiaToLabPosePert[3] = tibiaToLabPose[3] + dx;
        tibiaToLabPosePert[7] = tibiaToLabPose[7] + dy;
        tibiaToLabPosePert[11] = tibiaToLabPose[11] + dz;
        SMCLTibiaInsertionPositionPert[0] = SMCLTibiaInsertionPosition[0] + dx;
        SMCLTibiaInsertionPositionPert[1] = SMCLTibiaInsertionPosition[1] + dy;
        SMCLTibiaInsertionPositionPert[2] = SMCLTibiaInsertionPosition[2] + dz;
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
            Tibia translating around randomly of max. 5 mm:
            <div ref="viewer" style={{height: "80vh", width: "80vw"}}>
                <KneeModel
                    width={this.state.viewerWidth}
                    height={this.state.viewerHeight}
                    pixelRatio={window.devicePixelRatio}

                    femurFile={'./Spec57_Femur.stl'}
                    tibiaFile={'./Spec57_Tibia.stl'}

                    femurToLabPose={femurToLabPose}
                    tibiaToLabPose={tibiaToLabPosePert}

                    SMCLFemurInsertionPosition={SMCLFemurInsertionPosition}
                    SMCLTibiaInsertionPosition={SMCLTibiaInsertionPositionPert}

                    showFemur={true}
                    showTibia={true}
                    showSMCL={true}

                    screenToLabPose={screenToLabPose}

                    initCameraPosition={initCameraPosition}
                    initCameraLookAt={initCameraLookAt}
                />
            </div>
        </div>

    }

}


export default Container;
