dummymodels = "";
//var bucket = new AWS.S3({params: {Bucket: 'ramyakysamplebucket'}});
//     			console.log("Inside my script tag");
//                bucket.listObjects(function (err, data) {
//                    if (err) {
//                        console.log("Inside error");
//                        console.log("Failed");
//                    } else {
//                    	console.log("Printing dummy "  + dummymodels);
//                        dummymodels = "abc.txt,xyz.txt";
//                        console.log("Printing dummy "  + dummymodels);
//
//                        for (var i = 0; i < data.Contents.length; i++) {
//							console.log("Name : " + data.Contents[i].Key);
//                        }
//                        World.init();
//                    }
//
//                });

var World = {
	loaded: false,
	zoom: false,
	elemId:0,
	rotating: false,
	dummymodels: 'nothing',
	trackableVisible: true,
	snapped: false,
	lastTouch: {
		x: 0,
		y: 0
	},
	tmp: 0,
	count: 6,
	dist1: 0,
	dist2: 0,
	lastScale: 0,
	currentScale: 0,
	swipeAllowed: true,
	interactionContainer: 'snapContainer',
	layout: {
		normal: {
			offsetX: 0.35,
			offsetY: 0.45,
			opacity: 0.0,
			carScale: 0.03,
			carTranslateY: 0.05
		},
		snapped: {
			offsetX: 0.45,
			offsetY: 0.45,
			opacity: 0.2,
			carScale: 0.08,
			carTranslateY: 0
		}
	},

	init: function initFn() {
		this.createOverlays();
	},

	createOverlays: function createOverlaysFn() {
		/*
			First an AR.ClientTracker needs to be created in order to start the recognition engine. It is initialized with a URL specific to the target collection. Optional parameters are passed as object in the last argument. In this case a callback function for the onLoaded trigger is set. Once the tracker is fully loaded the function loadingStep() is called.
			Important: If you replace the tracker file with your own, make sure to change the target name accordingly.
			Use a specific target name to respond only to a certain target or use a wildcard to respond to any or a certain group of targets.
		*/
		this.tracker = new AR.ClientTracker("assets/tracker-7.wtc", {
			onLoaded: this.loadingStep
		});

		/*
			3D content within Wikitude can only be loaded from Wikitude 3D Format files (.wt3). This is a compressed binary format for describing 3D content which is optimized for fast loading and handling of 3D content on a mobile device. You still can use 3D models from your favorite 3D modeling tools (Autodesk® Maya® or Blender) but you'll need to convert them into the wt3 file format. The Wikitude 3D Encoder desktop application (Windows and Mac) encodes your 3D source file. You can download it from our website. The Encoder can handle Autodesk® FBX® files (.fbx) and the open standard Collada (.dae) file formats for encoding to .wt3.
			Create an AR.Model and pass the URL to the actual .wt3 file of the model. Additional options allow for scaling, rotating and positioning the model in the scene.
			A function is attached to the onLoaded trigger to receive a notification once the 3D model is fully loaded. Depending on the size of the model and where it is stored (locally or remotely) it might take some time to completely load and it is recommended to inform the user about the loading time.
		*/
		this.loadedModel = [];
		this.loadedModel[0] = false;
		this.loadedModel[1] = false;

		this.modelCar = [];
		this.appearingAnimation =[];
		this.rotationAnimation = [];



		//var dummymodels = document.getElementById("awsvalues").innerHTML;
		console.log("Printing dummy models inside: " + dummymodels);
		var models = ["assets/finebuggy.wt3", "assets/confChair.wt3", "assets/confChair.wt3", "assets/teapotbig.wt3", "assets/confChair.wt3", "assets/sodabottels.wt3"];
		//var models = ["https://s3.amazonaws.com/ramyakysamplebucket/sodabottels.wt3", "https://s3.amazonaws.com/ramyakysamplebucket/confChair.wt3", "https://s3.amazonaws.com/ramyakysamplebucket/confChair.wt3", "https://s3.amazonaws.com/ramyakysamplebucket/sodabottels.wt3", "https://s3.amazonaws.com/ramyakysamplebucket/confChair.wt3", "https://s3.amazonaws.com/ramyakysamplebucket/sodabottels.wt3"]
		for(var i=0; i<World.count; i++) {
			this.modelCar[i] = new AR.Model(models[i], {
				onLoaded: this.loadingStep,
				/*
                	The drawables are made clickable by setting their onClick triggers. Click triggers can be set in the options of the drawable when the drawable is created. Thus, when the 3D model onClick: this.toggleAnimateModel is set in the options it is then passed to the AR.Model constructor. Similar the button's onClick: this.toggleAnimateModel trigger is set in the options passed to the AR.ImageDrawable constructor. toggleAnimateModel() is therefore called when the 3D model or the button is clicked.

                	Inside the toggleAnimateModel() function, it is checked if the animation is running and decided if it should be started, resumed or paused.
                */
                scale: {
                	x: 0.06,
                	y: 0.06,
                	z: 0.06
                },
                translate: {
                	x: 0.0,
                	y: 0.05,
                	z: 0.0
                },
                rotate: {
                	roll: -25
                }
			});

			/*
            	As a next step, an appearing animation is created. For more information have a closer look at the function implementation.
            */
			this.appearingAnimation[i] = this.createAppearingAnimation(this.modelCar[i], 0.045);
			/*
            	The rotation animation for the 3D model is created by defining an AR.PropertyAnimation for the rotate.roll property.
            */
			this.rotationAnimation[i] = new AR.PropertyAnimation(this.modelCar[i], "rotate.roll", -25, 335, 10000);
		}

		/*
			Additionally to the 3D model an image that will act as a button is added to the image target. This can be accomplished by loading an AR.ImageResource and creating a drawable from it.
		*/
		var imgRotate = new AR.ImageResource("assets/rotateButton.png");
		this.buttonRotate = new AR.ImageDrawable(imgRotate, 0.2, {
			offsetX: 0.35,
			offsetY: 0.45,
			onClick: this.toggleAnimateModel
		});

		var imgSnap = new AR.ImageResource("assets/snapButton.png");
		this.buttonSnap = new AR.ImageDrawable(imgSnap, 0.2, {
			offsetX: -0.35,
			offsetY: -0.45,
			onClick: this.toggleSnapping
		});

		var imgZoomIn = new AR.ImageResource("assets/zoomIn.png");
		this.buttonZoonIn = new AR.ImageDrawable(imgZoomIn, 0.2, {
			offsetX: -0.85,
			offsetY: -0.95,
			onClick: this.zoomInImage
		});

		/*
			To receive a notification once the image target is inside the field of vision the onEnterFieldOfVision trigger of the AR.Trackable2DObject is used. In the example the function appear() is attached. Within the appear function the previously created AR.AnimationGroup is started by calling its start() function which plays the animation once.
			To add the AR.ImageDrawable to the image target together with the 3D model both drawables are supplied to the AR.Trackable2DObject.
		*/

		this.trackable = [];
		var qrCodes = ["qr_buggy", "qr_conferencechair","conferencechairdemo", "table1", "homeliving", "table2"];
		for(var i=0; i<World.count; i++) {
			this.trackable[i] = new AR.Trackable2DObject(this.tracker, qrCodes[i], {
            	drawables: {
            		cam: [this.modelCar[i], this.buttonRotate, this.buttonSnap]
            	},
            	snapToScreen: {
            		snapContainer: document.getElementById('snapContainer')
            	},
            	onEnterFieldOfVision: this.appear,
            	onExitFieldOfVision: this.disappear
            });
		}

		/*
			Event handler for touch and gesture events. The handler are used to calculate and set new rotate and scaling values for the 3D model.
		*/
		this.handleTouchStart = function handleTouchStartFn(event) {

			World.swipeAllowed = true;

			/* Once a new touch cycle starts, keep a save it's originating location */
			World.lastTouch.x = event.touches[0].clientX;
			World.lastTouch.y = event.touches[0].clientY;

			if (event.targetTouches.length == 2) {
				World.dist1 = Math.sqrt((event.targetTouches[0].pageX-event.targetTouches[1].pageX) * (event.targetTouches[0].pageX-event.targetTouches[1].pageX) + (event.targetTouches[0].pageY-event.targetTouches[1].pageY) * (event.targetTouches[0].pageY-event.targetTouches[1].pageY));
			}

			event.preventDefault();
		}

		this.handleTouchMove = function handleTouchMoveFn(event) {

			console.log("handleTouchMoveFn() ");
			if (World.swipeAllowed) {
				/* Define some local variables to keep track of the new touch location and the movement between the last event and the current one */
				var touch = {
					x: event.touches[0].clientX,
					y: event.touches[0].clientY
				};
				var movement = {
					x: 0,
					y: 0
				};

				/* Calculate the touch movement between this event and the last one */
				movement.x = (World.lastTouch.x - touch.x) * -1;
				movement.y = (World.lastTouch.y - touch.y) * -1;

				/* Rotate the car model accordingly to the calculated movement values. Note: we're slowing the movement down so that the touch action feels better */
				World.modelCar[World.elemId].rotate.heading += (movement.x * 0.3);
				World.modelCar[World.elemId].rotate.tilt += (movement.y * 0.3);

				/* Keep track of the current touch location. We need them in the next move cycle */
				World.lastTouch.x = touch.x;
				World.lastTouch.y = touch.y;
			}
			if (event.targetTouches.length == 2) {
					World.dist2 = Math.sqrt((event.targetTouches[0].pageX-event.targetTouches[1].pageX) * (event.targetTouches[0].pageX-event.targetTouches[1].pageX) + (event.targetTouches[0].pageY-event.targetTouches[1].pageY) * (event.targetTouches[0].pageY-event.targetTouches[1].pageY));
                    console.log("Printing the distance : " + World.dist2 + " and " + World.dist1);

                    if(World.dist1 < World.dist2) {
            			if(World.tmp == 0) {
                			World.tmp = World.layout.snapped.carScale;
                    	}

                    	World.modelCar[World.elemId].scale = {
                    		x: World.tmp + 0.001,
                        	y: World.tmp + 0.001,
                        	z: World.tmp + 0.001
                    	};
                    	World.tmp = World.modelCar[World.elemId].scale.x;
					}else {
						if(World.tmp == 0) {
							World.tmp = World.layout.snapped.carScale;
						}
						World.modelCar[World.elemId].scale = {
							x: World.tmp - 0.001,
							y: World.tmp - 0.001,
							z: World.tmp - 0.001
						};
						World.tmp = World.modelCar[World.elemId].scale.x;
					}
            }
			event.preventDefault();
		}

		this.handleGestureStart = function handleGestureStartFn(event) {

			console.log("handleGestureStartFn() ");
			/* Once a gesture is recognized, disable rotation changes */
			World.swipeAllowed = false;
			World.lastScale = event.scale;
		}

		this.handleGestureChange = function handleGestureChangeFn(event) {

			console.log("handleGestureChangeFn() ");
			/* Calculate the new scaling delta that should applied to the 3D model. */
			var deltaScale = (event.scale - World.lastScale) * 0.1;

			/* Negative scale values are not allowd by the 3D model API. So we use the Math.max function to ensure scale values >= 0. */
			var newScale = Math.max(World.modelCar[World.elemId].scale.x + deltaScale, 0);

			World.modelCar[World.elemId].scale = {
				x: newScale,
				y: newScale,
				z: newScale
			};

			/* Keep track of the current scale value so that we can calculate the scale delta in the next gesture changed function call */
			World.lastScale = event.scale;
		}

		this.handleGestureEnd = function handleGestureEndFn(event) {

			console.log("handleGestureEndFn() ");
			/* Once the gesture ends, allow rotation changes again */
			World.swipeAllowed = true;
			World.lastScale = event.scale;
		}
	},

	loadingStep: function loadingStepFn() {
		console.log("loadingStepFn() ");
		// Remove Scan target message after 10 sec.
        setTimeout(function() {
        var e = document.getElementById('loadingMessage');
        	e.parentElement.removeChild(e);
        },3000);

		//var htmlImages = ["assets/qr_buggy.png", "assets/qr_conferencechair", "assets/conferencechairdemo.jpg"];
		if (!World.loaded && World.tracker.isLoaded() ) {
			//console.log("World.modelCar[0].isLoaded() = " + World.modelCar[0].isLoaded() + " World.modelCar[1].isLoaded() = " + World.modelCar[1].isLoaded());
			console.log("tracker0 = " + World.trackable[0].isVisible());
			for(var i=0;i<3;i++) {
				if (World.trackable[i].isVisible()){
					World.loaded = true;
					World.elemId = i;
					if ( World.trackableVisible && !World.appearingAnimation[World.elemId].isRunning() ) {
						World.appearingAnimation[World.elemId].start();
					}
				}
			}
		}

	},

	createAppearingAnimation: function createAppearingAnimationFn(model, scale) {
		/*
			The animation scales up the 3D model once the target is inside the field of vision. Creating an animation on a single property of an object is done using an AR.PropertyAnimation. Since the car model needs to be scaled up on all three axis, three animations are needed. These animations are grouped together utilizing an AR.AnimationGroup that allows them to play them in parallel.

			Each AR.PropertyAnimation targets one of the three axis and scales the model from 0 to the value passed in the scale variable. An easing curve is used to create a more dynamic effect of the animation.
		*/
		var sx = new AR.PropertyAnimation(model, "scale.x", 0, scale, 1500, {
			type: AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC
		});
		var sy = new AR.PropertyAnimation(model, "scale.y", 0, scale, 1500, {
			type: AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC
		});
		var sz = new AR.PropertyAnimation(model, "scale.z", 0, scale, 1500, {
			type: AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC
		});

		return new AR.AnimationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, [sx, sy, sz]);
	},

	appear: function appearFn() {
		console.log("appearFn() ");
		World.trackableVisible = true;
		for(var i=0; i<World.count; i++) {
			if(World.trackable[i].isVisible()){
				elem = i;
			}
		}

		World.elemId = elem;
		if ( World.loaded && !World.snapped ) {
			// Resets the properties to the initial values.
			World.resetModel();
			World.appearingAnimation[World.elemId].start();
		}
	},
	disappear: function disappearFn() {
		World.trackableVisible = false;
	},

	resetModel: function resetModelFn() {
		console.log("resetModelFn() ");

		World.rotationAnimation[World.elemId].stop();
		World.rotating = false;
		World.modelCar[World.elemId].rotate.roll = -25;
	},

	toggleAnimateModel: function toggleAnimateModelFn() {
		console.log("toggleAnimateModelFn() ");
		for(var i=0; i<World.count; i++) {
        	if(World.trackable[i].isVisible()){
        		elem = i;
        	}
        }


		if (!World.rotationAnimation[elem].isRunning()) {
			if (!World.rotating) {
				// Starting an animation with .start(-1) will loop it indefinitely.
				World.rotationAnimation[elem].start(-1);
				World.rotating = true;
			} else {
				// Resumes the rotation animation
				World.rotationAnimation[elem].resume();
			}
		} else {
			// Pauses the rotation animation
			World.rotationAnimation[elem].pause();
		}

		return false;
	},

	zoomInImage: function zoomInImageFn() {
		console.log("zoomInImageFn() ");
		World.zoom = true;
		console.log("Calling applylayout method");
		World.applyLayout(World.layout.snapped);

	},

	/*
		This function is used to either snap the trackable onto the screen or to detach it. World.trackable.snapToScreen.enabled is therefore used. Depending on the snap state a new layout for the position and size of certain drawables is set. To allow rotation and scale changes only in the snapped state, event handler are added or removed based on the new snap state.
	*/
	toggleSnapping: function toggleSnappingFn() {
		console.log("toggleSnappingFn() ");
		World.snapped = !World.snapped;
		for(var i=0; i<World.count; i++) {
        	if(World.trackable[i].isVisible()){
        		elem = i;
        	}
       	}


		World.trackable[elem].snapToScreen.enabled = World.snapped;

		if (World.snapped) {
			World.applyLayout(World.layout.snapped);
			World.addInteractionEventListener();

		} else {
			World.applyLayout(World.layout.normal);
			World.removeInteractionEventListener();
			World.addInteractionEventListener();
		}
	},

	/*
		applyLayout is used to define position and scale of certain drawables in the scene for certain states. The different layouts are defined at the top of the World object.
	*/
	applyLayout: function applyLayoutFn(layout) {
		console.log("applyLayoutFn() ");

		World.buttonRotate.offsetX = layout.offsetX;
		World.buttonRotate.offsetY = layout.offsetY;

		World.buttonSnap.offsetX = -layout.offsetX;
		World.buttonSnap.offsetY = -layout.offsetY;

		for(var i=0; i<World.count; i++) {
        	if(World.trackable[i].isVisible()){
        		elem = i;
     		}
        }


		World.modelCar[elem].scale = {
			x: layout.carScale,
			y: layout.carScale,
			z: layout.carScale
		};
		World.modelCar[elem].translate = {
			x: 0.0,
			y: layout.carTranslateY,
			z: 0.0
		};
		console.log(World.zoom + " Value ");
		if(World.zoom) {

			World.modelCar[elem].scale = {
            			x: layout.carScale + 0.1,
            			y: layout.carScale + 0.1,
            			z: layout.carScale + 0.1
            		};
		}

		document.getElementById(World.interactionContainer).style.opacity = layout.opacity.toString();
	},

	/*
		Touch and gesture listener are added to allow rotation and scale changes in the snapped to screen state.
	*/
	addInteractionEventListener: function addInteractionEventListenerFn() {
		document.getElementById(World.interactionContainer).addEventListener('touchstart', World.handleTouchStart, false);
		document.getElementById(World.interactionContainer).addEventListener('touchmove', World.handleTouchMove, false);

		document.getElementById(World.interactionContainer).addEventListener('gesturestart', World.handleGestureStart, false);
		document.getElementById(World.interactionContainer).addEventListener('gesturechange', World.handleGestureChange, false);
		document.getElementById(World.interactionContainer).addEventListener('gestureend', World.handleGestureEnd, false);
	},
	removeInteractionEventListener: function removeInteractionEventListenerFn() {
		document.getElementById(World.interactionContainer).removeEventListener('touchstart', World.handleTouchStart, false);
		document.getElementById(World.interactionContainer).removeEventListener('touchmove', World.handleTouchMove, false);

		document.getElementById(World.interactionContainer).removeEventListener('gesturestart', World.handleGestureStart, false);
		document.getElementById(World.interactionContainer).removeEventListener('gesturechange', World.handleGestureChange, false);
		document.getElementById(World.interactionContainer).removeEventListener('gestureend', World.handleGestureEnd, false);
	}
};

World.init();