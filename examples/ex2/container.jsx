
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

//var SMCLPath = [SMCLFemurInsertionPosition, SMCLTibiaInsertionPositionPert];    // can give issues if empty

var SMCLPath = [];

var ligamentsPert = [];

var slowlyEdited = false;

var slowUpdates = (d) => d;

var points = [
    {label: 'FKC', color: 0x00ff00, pos: [14.2298, -122.0387, 243.4250], 'radius': 3},
    {label: 'FMCL', color: 0x00ff00, pos: [49.2056, -103.7274, 256.3688], 'radius': 3},
    {label: 'FLE', color: 0x00ff00, pos: [-23.0305, -124.1870, 260.1826], 'radius': 3},
    {label: 'FME', color: 0x00ff00, pos: [50.0912, -106.5834, 254.7950], 'radius': 3},

    {label: 'TKC', color: 0x00ff00, pos: [9.1822, -107.9099, 235.3582], 'radius': 3},
    {label: 'TAC', color: 0x00ff00, pos: [-11.3669, -98.5209, -83.7967], 'radius': 3},
    {label: 'TMCL', color: 0x00ff00, pos: [21.1704, -108.4569, 176.2609], 'radius': 3},
    {label: 'TMCA', color: 0x00ff00, pos: [32.0840, -127.8550, 232.2631], 'radius': 3},
    {label: 'TPM', color: 0x00ff00, pos: [42.9124, -103.5753, 228.0779 ], 'radius': 3},
    {label: 'TMCP', color: 0x00ff00, pos: [21.8245, -87.9204, 228.7193 ], 'radius': 3},
    {label: 'TLCP', color: 0x00ff00, pos: [-14.0062, -99.6700, 228.9098], 'radius': 3},
    {label: 'TLCA', color: 0x00ff00, pos: [-5.0069, -131.4017, 230.4314 ], 'radius': 3},
    {label: 'TPL', color: 0x00ff00, pos: [-21.1375, -117.6308, 231.9782 ], 'radius': 3},
    {label: 'TMCC', color: 0x00ff00, pos: [25.7390, -107.0144, 231.3183], 'radius': 3},
    {label: 'TLCC', color: 0x00ff00, pos: [-8.0572, -114.0371, 231.8557 ], 'radius': 3},
    {label: 'mT1', color: 0x00ff00, pos: [-120.9411, -251.9802, 99.2294 ], 'radius': 3},
    {label: 'mT2', color: 0x00ff00, pos: [-57.0325, -273.8666, 140.4072], 'radius': 3},
    {label: 'mT3', color: 0x00ff00, pos: [-67.5248, -258.2357, 47.2126 ], 'radius': 3},
    {label: 'mT4', color: 0x00ff00, pos: [-118.6083, -161.4379, 104.0218], 'radius': 3},
]

var pointsPert = points.map(p =>
    JSON.parse(JSON.stringify(p))
);



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
            updated: false,
        }

    }


    componentDidMount() {

        window.addEventListener('resize', this._onWindowResize, false);
        this._onWindowResize();
        this.th = setInterval(this._applyRandomMotion, 1000);

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
        SMCLPath = [SMCLFemurInsertionPosition, SMCLTibiaInsertionPositionPert];
        ligamentsPert = [
            {label: 'SMCL', color: 0xff0000, width: 3, path: SMCLPath},
        ];
        if (!slowlyEdited) {
            ligamentsPert[0].label = 'SMCL_';
            ligamentsPert[0].path.push([null, null, null]);
            ligamentsPert[0].color = 0x0000ff;
            slowlyEdited = true;
        } else {
            slowlyEdited = false;
        }
        for (var i = 4; i < pointsPert.length; i++) {
            pointsPert[i].pos[0] = points[i].pos[0] + dx;
            pointsPert[i].pos[1] = points[i].pos[1] + dy;
            pointsPert[i].pos[2] = points[i].pos[2] + dz;
        }
        this.setState({updated: true});
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

                    ligaments={ligamentsPert}

                    points={pointsPert}

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
