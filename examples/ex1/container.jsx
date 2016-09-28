
import React from 'react';
import {KneeModel} from 'react-three-kneerig';

/*

NOTE:

- screen coordinate system is normally: x right, y up, z out of screen towards user
- here lab coordinate system is created by rotating the screen one around its x axis by -90 deg

*/

var femurToLabPose = [
    9.98111796e-01,  -5.62190577e-02,  -2.47438806e-02,   1.87580376e+02,
    4.45348387e-02,   3.84923202e-01,   9.21873515e-01,  -3.17400454e+02,
   -4.23023665e-02,  -9.21234794e-01,   3.86700095e-01,   5.04342111e+02,
    0.00000000e+00,   0.00000000e+00,   0.00000000e+00,   1.00000000e+00
];

var tibiaToLabPose = [
    8.79084338e-01,  -4.76326273e-01,   1.80002114e-02,   1.36640366e+02,
    4.30918696e-01,   7.78005547e-01,  -4.57183165e-01,   9.13962531e+01,
    2.03764089e-01,   4.09659188e-01,   8.89190388e-01,   4.79057219e+02,
    0.00000000e+00,   0.00000000e+00,   0.00000000e+00,   1.00000000e+00
];

var screenToLabPose = [
    1,  0,  0,  0,
    0,  0,  1,  0,
    0, -1,  0,  0,
    0,  0,  0,  1
];

var initCameraPosition = [130, 600, 800];   // in screen coordinate system

var initCameraLookAt = [130, 600, 200];     // in screen coordinate system


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

                    femurToLabPose={femurToLabPose}
                    tibiaToLabPose={tibiaToLabPose}

                    showFemur={true}
                    showTibia={true}

                    screenToLabPose={screenToLabPose}

                    initCameraPosition={initCameraPosition}
                    initCameraLookAt={initCameraLookAt}
                />
            </div>
        </div>

    }

}


export default Container;
