React component, using [Three.js](https://threejs.org/) and
[react-three-renderer](https://github.com/toxicFork/react-three-renderer)
showing a 3D scene with STL femur, tibia and patella models. The scene:

* allows to load STL files for femur/tibia/patella;
* allows to set the pose for the bones;
* allows to set insertions positions for SMCL (Superficial Medical Collateral Ligament);
* allows to set initial camera position;
* has trackball controls (pan, tilt, zoom);
* contains a XY floor grid and global coordinate system helper

This is mainly used to have a real-time feedback from knee-squatting mechanical
devices, such as the [Oxford-Rig](https://gbiomed.kuleuven.be/english/research/50000640/iort/kneerig.gif/image_view_fullscreen)

Ligaments paths are being added, as long as patella.

The component __KneeModel__ has the following props:

* _width, height_ (int): dimensions of the viewer, in pixels;
* _pixelRatio_ (int): see [this](https://github.com/toxicFork/react-three-renderer/wiki/Entry-Point#pixelratio)
* _femurFile, tibiaFile, patellaFile_ (string): URL of STL files (e.g. http://localhost:8081/femur.stl, './femur.stl');
  Valid STL files are both ASCII and binary. You have to start a server to avoid CORS warnings.
* _femurToLabPose, tibiaToLabPose, patellaToLabPose_ (array): flattened version fo the 4x4 affine matrix from femur/tibia/patella to global coordinate system;
* _SMCLPath_ (array): array of 3-elements arrays representing MSCL insertions positions and via paths (in global coordinate system);
* _showFemur, showTibia, showPatella_ (bool): whether to show femur/tibia/patella in the scene;
* _screenToLabPose_ (array): flattened version fo the 4x4 affine matrix from screen to global coordinate system;
* _initCameraPosition_ (array): 3-elements array representing initial camera position (in screen coordinate system);
* _initCameraLookAt_ (array): 3-elements array representing initial camera target position (in screen coordinate system);

Keep in mind this:

- screen coordinate system, in Three.js, is normally:
  X pointing right, Y up, and Z out of the screen towards the user;

For a live example, click [here](https://u0078867.github.io/react-three-kneerig/examples/ex1/).
Other examples (ex2, ...) may be available.

For a standalone running example, You can find an example in the _examples_
folder. If you have Python installed, you can _cd_ to any example folder, open a
console and type:

python -m SimpleHTTPServer 8000

Then, in your favourite non-IE browser, type http://localhost:8000/index.html

If you want to rebuild the example yourself, you have the _gulpfile_ to use.
