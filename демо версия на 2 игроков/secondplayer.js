

window.focus(); //Захват клавиш сразу (по умолчанию фокус сосредоточен на редакторе)

// Выберите случайное значение из массива
function pickRandom(array) {
	return array[Math.floor(Math.random() * array.length)];
}
// Теорема Пифагора гласит, что расстояние между двумя точками равно
// квадратный корень из суммы квадратов горизонтального и вертикального расстояний
function getDistance(coordinate1, coordinate2) {
	const horizontalDistance = coordinate2.x - coordinate1.x;
	const verticalDistance = coordinate2.y - coordinate1.y;
	return Math.sqrt(horizontalDistance ** 2 + verticalDistance ** 2);
}

const vehicleColors = [
	0x6623A5,
	0xA56623,
	0x119911,
	0x252599 /*0xa52523, 0xbdb638, 0x78b14b*/
];

const lawnGreen = "#e4eefb";
const trackColor = "#546E90";
const edgeColor = "#725F48";
const treeCrownColor = 0xFAEEDD;
const treeTrunkColor = 0x4b3f2f;

const wheelGeometry = new THREE.BoxBufferGeometry(12, 33, 12);
const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });//асфальт
const treeTrunkGeometry = new THREE.BoxBufferGeometry(15, 15, 30);
const treeTrunkMaterial = new THREE.MeshLambertMaterial({
	color: treeTrunkColor
});
const treeCrownMaterial = new THREE.MeshLambertMaterial({
	color: treeCrownColor
});

const config = {
	showHitZones: false,
	shadows: true, // Использовать тень
	trees: true, // Добавить деревья на карту
	curbs: true, // Показать текстуру на экструдированной геометрии
	grid: false // Показать помощник по сетке
};
let record=localStorage.getItem('record')
let score;
let car=1;//количество машин
let speed = 0.0017;
let circle=1;
let point=1;
let drift=0;
let drift2=0;
let playerpoints;

const playerAngleInitial = Math.PI;
const secondplayerAngleInitial = Math.PI;
let playerAngleMoved;
let secondplayerAngleMoved;
// 2 игрок
let turbo2= false;
let revers2 = false;// задний ход
let accelerate2= false;// Ускоряется ли игрок
let decelerate2= false; // Замедляется ли игрок

let turbo= false;
let revers  = false;// задний ход
let accelerate = false;// Ускоряется ли игрок
let decelerate = false; // Замедляется ли игрок
let pauseplay =false;
let vido=(Math.floor(Math.random() * 2) === 0);
let addcar=false

let otherVehicles = [];
let ready;
let lastTimestamp;

const trackRadius = 225;
const trackWidth = 45;
const innerTrackRadius = trackRadius - trackWidth;
const outerTrackRadius = trackRadius + trackWidth;

const arcAngle1 = (1 / 3) * Math.PI;// 60 градусов

const deltaY = Math.sin(arcAngle1) * innerTrackRadius;
const arcAngle2 = Math.asin(deltaY / outerTrackRadius);

const arcCenterX =
	(Math.cos(arcAngle1) * innerTrackRadius +
		Math.cos(arcAngle2) * outerTrackRadius) /
	2;

const arcAngle3 = Math.acos(arcCenterX / innerTrackRadius);

const arcAngle4 = Math.acos(arcCenterX / outerTrackRadius);

const scoreElement = document.getElementById("score");
const buttonsElement = document.getElementById("buttons");
const instructionsElement = document.getElementById("instructions");
const resultsElement = document.getElementById("results");
const victoryElement = document.getElementById("victory");
const accelerateButton = document.getElementById("accelerate");
const decelerateButton = document.getElementById("decelerate");
const delresetButton = document.getElementById("delreset");
const victoryresetButton = document.getElementById("victoryreset");
const turboButton = document.getElementById("turbo");
const reversButton = document.getElementById("revers");
const pauseplayButton= document.getElementById("pauseplay");
const victorynormallyresetButton= document.getElementById("victorynormallyreset");
const difficultresetButton= document.getElementById("difficultreset");
const addcarButton= document.getElementById("add-car");

setTimeout(() => {
	if (ready) instructionsElement.style.opacity = 1;
	buttonsElement.style.opacity = 1;

}, 4000);

// Инициализировать ThreeJS
// Настройка камеры
const aspectRatio = window.innerWidth / window.innerHeight;
const cameraWidth = 960;
const cameraHeight = cameraWidth / aspectRatio;

const camera = new THREE.OrthographicCamera(
	cameraWidth / -2, // ширина камеры / -2,  слева.
	cameraWidth / 2, //ширина камеры / 2, // справа.
	cameraHeight /1.7 , // высота камеры / 2, // верхняя
	cameraHeight / -1.7, // высота камеры / -2, // нижняя
	50, // near plane50, // рядом с самолетом
	700 // far plane 700 // дальний план
);

camera.position.set(0, -210, 300);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();

const playerCar = Car();
scene.add(playerCar);
const secondplayerCar = Car();
scene.add(secondplayerCar);

renderMap(cameraWidth, cameraHeight * 2);// Высота карты выше, потому что мы смотрим на карту под углом

// Настройка освещения
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(100, -300, 300);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.left = -400;
dirLight.shadow.camera.right = 350;
dirLight.shadow.camera.top = 400;
dirLight.shadow.camera.bottom = -300;
dirLight.shadow.camera.near = 100;
dirLight.shadow.camera.far = 800;
scene.add(dirLight);

// const cameraHelper = new THREE.CameraHelper(dirLight.shadow.camera);
// scene.add(cameraHelper);

if (config.grid) {
	const gridHelper = new THREE.GridHelper(80, 8);
	gridHelper.rotation.x = Math.PI / 2;
	scene.add(gridHelper);
}

// Настройка средства визуализации
const renderer = new THREE.WebGLRenderer({
	antialias: true,
	powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
if (config.shadows) renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

reset();

function reset() {
	// Сбросить позицию и счет
	playerAngleMoved = 0;
	secondplayerAngleMoved = 0;
	score = 0;
	playerpoints=0;
	scoreElement.innerText = "Нажмите ВВЕРХ";
	document.querySelector('.price_result').innerHTML=score;
	turbo = false;
	drift=0;
	drift2=0;
	vido=(Math.floor(Math.random() * 2) === 0)
	// Убрать другие транспортные средства
	otherVehicles.forEach((vehicle) => {
		// Remove the vehicle from the scene
		scene.remove(vehicle.mesh);

		// Если у него есть помощники в зоне попадания, то удалите и их
		if (vehicle.mesh.userData.hitZone1)
			scene.remove(vehicle.mesh.userData.hitZone1);
		if (vehicle.mesh.userData.hitZone2)
			scene.remove(vehicle.mesh.userData.hitZone2);
		if (vehicle.mesh.userData.hitZone3)
			scene.remove(vehicle.mesh.userData.hitZone3);
	});
	otherVehicles = [];

	resultsElement.style.display = "none";
	victoryElement.style.display = "none";

	lastTimestamp = undefined;

	// Поставьте автомобиль игрока в исходное положение
	movePlayerCar(0);
	movesecondplayerCar(0);

	// Рендеринг сцены
	renderer.render(scene, camera);

	ready = true;
}

function startGame() {
	if (ready) {
		ready = false;
		scoreElement.innerText = 0;
		buttonsElement.style.opacity = 1;
		instructionsElement.style.opacity = 0;
		renderer.setAnimationLoop(animation);
	}

}

function positionScoreElement() {
	const arcCenterXinPixels = (arcCenterX / cameraWidth) * window.innerWidth;
	scoreElement.style.cssText = `
		left: ${window.innerWidth / 2 - arcCenterXinPixels * 1.3}px;
		top: ${window.innerHeight / 2}px
	`;
}
// дорожная разметка
function getLineMarkings(mapWidth, mapHeight) {
	const canvas = document.createElement("canvas");
	canvas.width = mapWidth;
	canvas.height = mapHeight;
	const context = canvas.getContext("2d");

	context.fillStyle = trackColor;
	context.fillRect(0, 0, mapWidth, mapHeight);

	context.lineWidth = 2;
	context.strokeStyle = "#E0FFFF";
	context.setLineDash([10, 14]);

	// Левый круг
	context.beginPath();
	context.arc(
		mapWidth / 2 - arcCenterX,
		mapHeight / 2,
		trackRadius,
		0,
		Math.PI * 2
	);
	context.stroke();

	// Правый круг
	context.beginPath();
	context.arc(
		mapWidth / 2 + arcCenterX,
		mapHeight / 2,
		trackRadius,
		0,
		Math.PI * 2
	);
	context.stroke();

	return new THREE.CanvasTexture(canvas);
}

function getCurbsTexture(mapWidth, mapHeight) {
	const canvas = document.createElement("canvas");
	canvas.width = mapWidth;
	canvas.height = mapHeight;
	const context = canvas.getContext("2d");

	context.fillStyle = lawnGreen;
	context.fillRect(0, 0, mapWidth, mapHeight);

// круг-овал большой
	context.lineWidth = 65;
	context.strokeStyle = "#e4eefb";
	context.beginPath();
	context.arc(
		mapWidth / 2 - arcCenterX,
		mapHeight / 2,
		innerTrackRadius,
		arcAngle1,
		-arcAngle1
	);
	context.arc(
		mapWidth / 2 + arcCenterX,
		mapHeight / 2,
		outerTrackRadius,
		Math.PI + arcAngle2,
		Math.PI - arcAngle2,
		true
	);
	context.stroke();

	context.beginPath();
	context.arc(
		mapWidth / 2 + arcCenterX,
		mapHeight / 2,
		innerTrackRadius,
		Math.PI + arcAngle1,
		Math.PI - arcAngle1
	);
	context.arc(
		mapWidth / 2 - arcCenterX,
		mapHeight / 2,
		outerTrackRadius,
		arcAngle2,
		-arcAngle2,
		true
	);
	context.stroke();

	// малый круг
	context.lineWidth = 60;
	context.strokeStyle = lawnGreen;
	context.beginPath();
	context.arc(
		mapWidth / 2 - arcCenterX,
		mapHeight / 2,
		innerTrackRadius,
		arcAngle1,
		-arcAngle1
	);
	context.arc(
		mapWidth / 2 + arcCenterX,
		mapHeight / 2,
		outerTrackRadius,
		Math.PI + arcAngle2,
		Math.PI - arcAngle2,
		true
	);
	context.arc(
		mapWidth / 2 + arcCenterX,
		mapHeight / 2,
		innerTrackRadius,
		Math.PI + arcAngle1,
		Math.PI - arcAngle1
	);
	context.arc(
		mapWidth / 2 - arcCenterX,
		mapHeight / 2,
		outerTrackRadius,
		arcAngle2,
		-arcAngle2,
		true
	);
	context.stroke();

	// Base// Основание
	context.lineWidth = 6;
	context.strokeStyle = edgeColor;
 
	// Внешний круг слева
	context.beginPath();
	context.arc(
		mapWidth / 2 - arcCenterX,
		mapHeight / 2,
		outerTrackRadius,
		0,
		Math.PI * 2
	);
	context.stroke();

	// Внешний круг справа
	context.beginPath();
	context.arc(
		mapWidth / 2 + arcCenterX,
		mapHeight / 2,
		outerTrackRadius,
		0,
		Math.PI * 2
	);
	context.stroke();

	// Внутренний круг слева
	context.beginPath();
	context.arc(
		mapWidth / 2 - arcCenterX,
		mapHeight / 2,
		innerTrackRadius,
		0,
		Math.PI * 2
	);
	context.stroke();

	// Внутренний круг справа
	context.beginPath();
	context.arc(
		mapWidth / 2 + arcCenterX,
		mapHeight / 2,
		innerTrackRadius,
		0,
		Math.PI * 2
	);
	context.stroke();

	return new THREE.CanvasTexture(canvas);
}

function getLeftIsland() {
	const islandLeft = new THREE.Shape();

	islandLeft.absarc(
		-arcCenterX,
		0,
		innerTrackRadius,
		arcAngle1,
		-arcAngle1,
		false
	);

	islandLeft.absarc(
		arcCenterX,
		0,
		outerTrackRadius,
		Math.PI + arcAngle2,
		Math.PI - arcAngle2,
		true
	);

	return islandLeft;
}

function getMiddleIsland() {
	const islandMiddle = new THREE.Shape();

	islandMiddle.absarc(
		-arcCenterX,
		0,
		innerTrackRadius,
		arcAngle3,
		-arcAngle3,
		true
	);

	islandMiddle.absarc(
		arcCenterX,
		0,
		innerTrackRadius,
		Math.PI + arcAngle3,
		Math.PI - arcAngle3,
		true
	);

	return islandMiddle;
}

function getRightIsland() {
	const islandRight = new THREE.Shape();

	islandRight.absarc(
		arcCenterX,
		0,
		innerTrackRadius,
		Math.PI - arcAngle1,
		Math.PI + arcAngle1,
		true
	);

	islandRight.absarc(
		-arcCenterX,
		0,
		outerTrackRadius,
		-arcAngle2,
		arcAngle2,
		false
	);

	return islandRight;
}

function getOuterField(mapWidth, mapHeight) {
	const field = new THREE.Shape();

	field.moveTo(-mapWidth / 2, -mapHeight / 2);
	field.lineTo(0, -mapHeight / 2);

	field.absarc(-arcCenterX, 0, outerTrackRadius, -arcAngle4, arcAngle4, true);

	field.absarc(
		arcCenterX,
		0,
		outerTrackRadius,
		Math.PI - arcAngle4,
		Math.PI + arcAngle4,
		true
	);

	field.lineTo(0, -mapHeight / 2);
	field.lineTo(mapWidth / 2, -mapHeight / 2);
	field.lineTo(mapWidth / 2, mapHeight / 2);
	field.lineTo(-mapWidth / 2, mapHeight / 2);

	return field;
}

function renderMap(mapWidth, mapHeight) {
	const lineMarkingsTexture = getLineMarkings(mapWidth, mapHeight);

	const planeGeometry = new THREE.PlaneBufferGeometry(mapWidth, mapHeight);
	const planeMaterial = new THREE.MeshLambertMaterial({
		map: lineMarkingsTexture
	});
	const plane = new THREE.Mesh(planeGeometry, planeMaterial);
	plane.receiveShadow = true;
	plane.matrixAutoUpdate = false;
	scene.add(plane);

// Экструдированная геометрия с бордюрами
	const islandLeft = getLeftIsland();
	const islandMiddle = getMiddleIsland();
	const islandRight = getRightIsland();
	const outerField = getOuterField(mapWidth, mapHeight);

 // Отображение текстуры на экструдированную геометрию работает иначе, чем отображение ее на прямоугольник
// По умолчанию он отображается на единичный квадрат 1x1, и мы должны растянуть его, установив повтор
// Нам также нужно сместить его, установив смещение, чтобы он был центрирован
	const curbsTexture = getCurbsTexture(mapWidth, mapHeight);
	curbsTexture.offset = new THREE.Vector2(0.5, 0.5);
	curbsTexture.repeat.set(1 / mapWidth, 1 / mapHeight);

	// Экструдированная геометрия превращает 2D-форму в 3D, придавая ей глубину
	const fieldGeometry = new THREE.ExtrudeBufferGeometry(
		[islandLeft, islandRight, islandMiddle, outerField],
		{ depth: 6, bevelEnabled: false }
	);
//бардюр
	const fieldMesh = new THREE.Mesh(fieldGeometry, [
		new THREE.MeshLambertMaterial({
	// Либо установите обычный цвет, либо текстуру в зависимости от конфигурации
			color: !config.curbs && lawnGreen,
			map: config.curbs && curbsTexture
		}),
		new THREE.MeshLambertMaterial({ color: 0x23311c })
	]);
	fieldMesh.receiveShadow = true;
	fieldMesh.matrixAutoUpdate = false;
	scene.add(fieldMesh);

	positionScoreElement();

	if (config.trees) {
		const tree1 = Tree();
		tree1.position.x = arcCenterX * 1.3;
		scene.add(tree1);

		const tree2 = Tree();
		tree2.position.y = arcCenterX * 1.9;
		tree2.position.x = arcCenterX * 1.3;
		scene.add(tree2);

		const tree3 = Tree();
		tree3.position.x = arcCenterX * 0.8;
		tree3.position.y = arcCenterX * 2;
		scene.add(tree3);

		const tree4 = Tree();
		tree4.position.x = -arcCenterX-50;
		tree4.position.y = -arcCenterX+200;
		scene.add(tree4);

		const tree5 = Tree();
		tree5.position.x = -arcCenterX * 1;
		tree5.position.y = arcCenterX * 2;
		scene.add(tree5);

		const tree6 = Tree();
		tree6.position.x = -arcCenterX * 2;
		tree6.position.y = arcCenterX * 1.8;
		scene.add(tree6);

		const tree7 = Tree();
		tree7.position.x = arcCenterX * 0.8;
		tree7.position.y = -arcCenterX * 2;
		scene.add(tree7);

		const tree8 = Tree();
		tree8.position.x = arcCenterX * 1.8;
		tree8.position.y = -arcCenterX * 2;
		scene.add(tree8);

		const tree9 = Tree1();
		tree9.position.x = -arcCenterX * 1;
		tree9.position.y = -arcCenterX * 2;
		scene.add(tree9);

		const tree10 = Tree();
		tree10.position.x = +arcCenterX * 2;
		tree10.position.y = +arcCenterX * 1.8;
		scene.add(tree10);

		const tree11 = Tree1();
		tree11.position.x = arcCenterX;
		tree11.position.y = -arcCenterX;
		scene.add(tree11);

		const tree12 = Tree();
		tree12.position.x = arcCenterX * 1.5;
		tree12.position.y = -arcCenterX * 2.4;
		scene.add(tree12);

		const tree13 = Tree();
		tree13.position.x = -arcCenterX * 0.7;
		tree13.position.y = -arcCenterX * 2.4;
		scene.add(tree13);

		const tree14 = Tree();
		tree14.position.x = -arcCenterX * 1.5;
		tree14.position.y = -arcCenterX * 1.8;
		scene.add(tree14);
	}
}

function getCarFrontTexture() {
	const canvas = document.createElement("canvas");
	canvas.width = 64;
	canvas.height = 32;
	const context = canvas.getContext("2d");

	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, 64, 32);

	context.fillStyle = "#666666";
	context.fillRect(8, 8, 48, 24);

	return new THREE.CanvasTexture(canvas);
}

function getCarSideTexture() {
	const canvas = document.createElement("canvas");
	canvas.width = 128;
	canvas.height = 32;
	const context = canvas.getContext("2d");

	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, 128, 32);

	context.fillStyle = "#666666";
	context.fillRect(10, 8, 38, 24);
	context.fillRect(58, 8, 60, 24);

	return new THREE.CanvasTexture(canvas);
}
// машинка
function Car() {
	const car = new THREE.Group();

	const color = pickRandom(vehicleColors);

	const main = new THREE.Mesh(
		new THREE.BoxBufferGeometry(60, 30, 15),
		new THREE.MeshLambertMaterial({ color })
	);
	main.position.z = 12;
	main.castShadow = true;
	main.receiveShadow = true;
	car.add(main);

	const carFrontTexture = getCarFrontTexture();
	carFrontTexture.center = new THREE.Vector2(0.5, 0.5);
	carFrontTexture.rotation = Math.PI / 2;

	const carBackTexture = getCarFrontTexture();
	carBackTexture.center = new THREE.Vector2(0.5, 0.5);
	carBackTexture.rotation = -Math.PI / 2;

	const carLeftSideTexture = getCarSideTexture();
	carLeftSideTexture.flipY = false;

	const carRightSideTexture = getCarSideTexture();

	const cabin = new THREE.Mesh(new THREE.BoxBufferGeometry(33, 24, 12), [
		new THREE.MeshLambertMaterial({ map: carFrontTexture }),
		new THREE.MeshLambertMaterial({ map: carBackTexture }),
		new THREE.MeshLambertMaterial({ map: carLeftSideTexture }),
		new THREE.MeshLambertMaterial({ map: carRightSideTexture }),
		new THREE.MeshLambertMaterial({ color: 0xffffff }), // верх
		new THREE.MeshLambertMaterial({ color: 0xffffff }) // внизу
	]);
	cabin.position.x = -6;
	cabin.position.z = 25.5;
	cabin.castShadow = true;
	cabin.receiveShadow = true;
	car.add(cabin);

	const backWheel = new Wheel();
	backWheel.position.x = -18;
	car.add(backWheel);

	const frontWheel = new Wheel();
	frontWheel.position.x = 18;
	car.add(frontWheel);

	if (config.showHitZones) {
		car.userData.hitZone1 = HitZone();
		car.userData.hitZone2 = HitZone();
	}

	return car;
}

function getTruckFrontTexture() {
	const canvas = document.createElement("canvas");
	canvas.width = 32;
	canvas.height = 32;
	const context = canvas.getContext("2d");

	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, 32, 32);

	context.fillStyle = "#666666";
	context.fillRect(0, 5, 32, 10);

	return new THREE.CanvasTexture(canvas);
}

function getTruckSideTexture() {
	const canvas = document.createElement("canvas");
	canvas.width = 32;
	canvas.height = 32;
	const context = canvas.getContext("2d");

	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, 32, 32);

	context.fillStyle = "#666666";
	context.fillRect(17, 5, 15, 10);

	return new THREE.CanvasTexture(canvas);
}


function HitZone() {
	const hitZone = new THREE.Mesh(
		new THREE.CylinderGeometry(20, 20, 60, 30),
		new THREE.MeshLambertMaterial({ color: 0xff0000 })
	);
	hitZone.position.z = 25;
	hitZone.rotation.x = Math.PI / 2;

	scene.add(hitZone);
	return hitZone;
}

function Wheel() {
	const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
	wheel.position.z = 6;
	wheel.castShadow = false;
	wheel.receiveShadow = false;
	return wheel;
}
function Tree1() {
	const tree = new THREE.Group();

	const trunk = new THREE.Mesh(treeTrunkGeometry, treeTrunkMaterial);
	trunk.position.z = 10;
	trunk.castShadow = true;
	trunk.receiveShadow = true;
	trunk.matrixAutoUpdate = false;
	tree.add(trunk);

	const treeHeights = [45, 60, 75];
	const height = pickRandom(treeHeights);

	const crown = new THREE.Mesh(
		new THREE.SphereGeometry(height /2, 30, 30),
		
		treeCrownMaterial
	);
	crown.rotation.x=1;
	crown.position.z = height / 2 + 30;
	crown.castShadow = true;
	crown.receiveShadow = false;
	tree.add(crown);

	return tree;
}
// дерево
function Tree() {
	const tree = new THREE.Group();

	const trunk = new THREE.Mesh(treeTrunkGeometry, treeTrunkMaterial);
	trunk.position.z = 10;
	trunk.castShadow = true;
	trunk.receiveShadow = true;
	trunk.matrixAutoUpdate = false;
	tree.add(trunk);

	const treeHeights = [45, 60, 75];
	const height = pickRandom(treeHeights);

	const crown = new THREE.Mesh(
		new THREE.ConeBufferGeometry(height /2, 40, 32),
		
		treeCrownMaterial
	);
	crown.rotation.x=1;
	crown.position.z = height / 2 + 30;
	crown.castShadow = true;
	crown.receiveShadow = false;
	tree.add(crown);

	return tree;
}
// управление мышкой
addcarButton.addEventListener("mousedown", function () {
	addVehicle();
	car+=1;
});
addcarButton.addEventListener("mouseup", function () {

});
accelerateButton.addEventListener("mousedown", function () {
	startGame();
	accelerate = true;
});
decelerateButton.addEventListener("mousedown", function () {
	startGame();
	decelerate = true;
});
accelerateButton.addEventListener("mouseup", function () {
	accelerate = false;
});
decelerateButton.addEventListener("mouseup", function () {
	decelerate = false;
});

delresetButton.addEventListener("mousedown", function () {
	reset();
});
victoryresetButton.addEventListener("mousedown", function () {
	reset();
});
turboButton.addEventListener("mousedown", function () {
	startGame();
	turbo = true;
	drift=-0.6;
});
reversButton.addEventListener("mousedown", function () {
	startGame();
	revers = true;
});

pauseplayButton.addEventListener("mousedown", function () {
	pauseplay=!pauseplay;
	if(pauseplay){
		speed=0;
		pauseplayButton.children[0].style.display='none';
		pauseplayButton.children[1].style.display='initial';
	}else{
		speed= 0.0017;
		pauseplayButton.children[0].style.display='initial';
		pauseplayButton.children[1].style.display='none';
	}
});
turboButton.addEventListener("mouseup", function () {
	turbo = false;
	drift=0;
});
reversButton.addEventListener("mouseup", function () {
	revers = false;
});

// управление клавиатурой
window.addEventListener("keydown", function (event) {
	if (event.key == "ArrowLeft") {
		startGame();
		revers = true;
		return;
	}
	if (event.key == "ArrowUp") {
		startGame();
		accelerate = true;
		return;
	}
	if (event.key == "ArrowDown") {
		decelerate = true;
		return;
	}
	if (event.key == "ArrowRight") {
		startGame();
		turbo = true;
		drift2=-0.6;
		return;
	}
});
window.addEventListener("keyup", function (event) {
	if (event.key == "ArrowLeft") {
		revers = false;
		return;
	}
	if (event.key == "ArrowUp") {
		accelerate = false;
		return;
	}
	if (event.key == "ArrowDown") {
		decelerate = false;
		return;
	}
	if  (event.key == "ArrowRight") {
		turbo = false;
		drift2=0;
		return;
	}
});
// клавиатура 2 играка
window.addEventListener("keydown", function (event) {
	if (event.code == "KeyA") {
		startGame();
		revers2 = true;
		return;
	}
	if (event.code == "KeyW") {
		startGame();
		accelerate2 = true;
		return;
	}
	if (event.code == "KeyS") {
		decelerate2 = true;
		return;
	}
	if (event.code == "KeyD") {
		startGame();
		turbo2 = true;
		drift=-0.6;
		return;
	}
});
window.addEventListener("keyup", function (event) {
	if (event.code == "KeyA") {
		revers2 = false;
		return;
	}
	if (event.code == "KeyW") {
		accelerate2 = false;
		return;
	}
	if (event.code == "KeyS") {
		decelerate2 = false;
		return;
	}
	if (event.code == "KeyD") {
		turbo2 = false;
		drift=0;
		return;
	}
});
// телефон
addcarButton.addEventListener("touchstart", function () {
	addVehicle()
	car+=1;
});
addcarButton.addEventListener("touchend", function () {

});
accelerateButton.addEventListener("touchstart", function () {
	startGame();
	accelerate = true;
});
decelerateButton.addEventListener("touchstart", function () {
	startGame();
	decelerate = true;
});
accelerateButton.addEventListener("touchend", function () {
	accelerate = false;
});
decelerateButton.addEventListener("touchend", function () {
	decelerate = false;
});
delresetButton.addEventListener("touchstart", function () {
	reset();
});
victoryresetButton.addEventListener("touchstart", function () {
	reset();
});
turboButton.addEventListener("touchstart", function () {
	startGame();
	turbo = true;
	drift=-0.6;
});
reversButton.addEventListener("touchstart", function () {
	startGame();
	revers = true;
});
pauseplayButton.addEventListener("touchstart", function () {
	pauseplay=!pauseplay;
	if(pauseplay){
		speed=0;
		pauseplayButton.children[0].style.display='none';
		pauseplayButton.children[1].style.display='initial';
	}else{
		speed= 0.0017;
		pauseplayButton.children[0].style.display='initial';
		pauseplayButton.children[1].style.display='none';
	}
});
// управление с телефона
turboButton.addEventListener("touchend", function () {
	turbo = false;
	drift=0;
});
reversButton.addEventListener("touchend", function () {
	revers = false;
});



function animation(timestamp) {
	if (!lastTimestamp) {
		lastTimestamp = timestamp;
		return;
	}

	const timeDelta = timestamp - lastTimestamp;

	movePlayerCar(timeDelta);
	movesecondplayerCar(timeDelta);

	const laps = Math.floor(Math.abs(playerAngleMoved) / (Math.PI * 2));

	// Обновить оценку, если она изменилась
	if (laps != score) {
		score = laps;
		playerpoints=(laps+car)*point;
		scoreElement.innerText = score;
			document.querySelector('.price_result').innerHTML=playerpoints;
			document.querySelector('.record1').innerHTML=record;
			document.querySelector('.result').innerHTML=playerpoints;
			document.querySelector('.recordv').innerHTML=record;
		if(record<playerpoints || record==undefined){
			record =localStorage.setItem('record',playerpoints);
			record=localStorage.getItem('record')
		}
			document.querySelector('.record1').innerHTML=record;
			
	}

	// Добавляйте новое транспортное средство в начале и на каждом n-м круге
	
	
	moveOtherVehicles(timeDelta);

	hitDetection();
	victory();

	renderer.render(scene, camera);
	lastTimestamp = timestamp;
}
function movePlayerCar(timeDelta) {
	const playerSpeed = getPlayerSpeed();
	playerAngleMoved -= playerSpeed * timeDelta;

	const totalPlayerAngle = playerAngleInitial + playerAngleMoved;

	const playerX = Math.cos(totalPlayerAngle) * trackRadius - arcCenterX;
	const playerY = Math.sin(totalPlayerAngle) * trackRadius;

	playerCar.position.x = playerX;
	playerCar.position.y = playerY;

	playerCar.rotation.z = totalPlayerAngle + drift - Math.PI / 2;
}

function movesecondplayerCar(timeDelta) {
	const secondplayerSpeed = get2PlayerSpeed();
	secondplayerAngleMoved -= secondplayerSpeed * timeDelta;

	const totalsecondplayerAngle = secondplayerAngleInitial + secondplayerAngleMoved;

	const secondplayerX = Math.cos(totalsecondplayerAngle) * trackRadius + arcCenterX;
	const secondplayerY = Math.sin(totalsecondplayerAngle) * trackRadius;

	secondplayerCar.position.x = secondplayerX;
	secondplayerCar.position.y = secondplayerY;

	secondplayerCar.rotation.z = totalsecondplayerAngle + drift2 - Math.PI / 2;
	
}

function moveOtherVehicles(timeDelta) {
	otherVehicles.forEach((vehicle) => {
		if (vehicle.clockwise) {
			vehicle.angle -= speed * timeDelta * vehicle.speed;
		} else {
			vehicle.angle += speed * timeDelta * vehicle.speed;
		}

		const vehicleX = Math.cos(vehicle.angle) * trackRadius + arcCenterX;
		const vehicleY = Math.sin(vehicle.angle) * trackRadius;
		const rotation =
			vehicle.angle + (vehicle.clockwise ? -Math.PI / 2 : Math.PI / 2);
		vehicle.mesh.position.x = vehicleX;
		vehicle.mesh.position.y = vehicleY;
		vehicle.mesh.rotation.z = rotation;
	});
}

function getPlayerSpeed() {
	if (accelerate2) return speed * 2;
	if (decelerate2) return speed * 0.5;
	if (revers2) return -speed;
	if (turbo2) return speed*5;
	return speed;
}

function get2PlayerSpeed() {
	if (accelerate) return speed * 2;
	if (decelerate) return speed * 0.5;
	if (revers) return -speed;
	if (turbo) return speed*5;
	return speed;
}


function getHitZonePosition(center, angle, clockwise, distance) {
	const directionAngle = angle + clockwise ? -Math.PI / 2 : +Math.PI / 2;
	return {
		x: center.x + Math.cos(directionAngle) * distance,
		y: center.y + Math.sin(directionAngle) * distance
	};
}

function hitDetection() {
	const playerHitZone1 = getHitZonePosition(
		playerCar.position,
		playerAngleInitial + playerAngleMoved,
		true,
		15
	);

	const playerHitZone2 = getHitZonePosition(
		playerCar.position,
		playerAngleInitial + playerAngleMoved,
		true,
		-15
	);

	if (config.showHitZones) {
		playerCar.userData.hitZone1.position.x = playerHitZone1.x;
		playerCar.userData.hitZone1.position.y = playerHitZone1.y;

		playerCar.userData.hitZone2.position.x = playerHitZone2.x;
		playerCar.userData.hitZone2.position.y = playerHitZone2.y;
	}
   // 2 игрок
   const hitplaer = false;
   if (hitplaer==false){
	const secondplayerHitZone1 = getHitZonePosition(
		secondplayerCar.position,
		secondplayerAngleInitial + secondplayerAngleMoved,
		true,
		15
	);
	
	const secondplayerHitZone2 = getHitZonePosition(
		secondplayerCar.position,
		secondplayerAngleInitial + secondplayerAngleMoved,
		true,
		-15
	);
	
	if (config.showHitZones) {
		secondplayerCar.userData.hitZone1.position.x = secondplayerHitZone1.x;
		secondplayerCar.userData.hitZone1.position.y = secondplayerHitZone1.y;
	
		secondplayerCar.userData.hitZone2.position.x = secondplayerHitZone2.x;
		secondplayerCar.userData.hitZone2.position.y = secondplayerHitZone2.y;
	}
	
	// Игрок врезается в другое транспортное средство
	if (getDistance(playerHitZone1, secondplayerHitZone1) < 40) {
	if (resultsElement) resultsElement.style.display = "flex";
	renderer.setAnimationLoop(null); // Остановить цикл анимации;
	}
	if (getDistance(playerHitZone1, secondplayerHitZone2) < 40) {
		if (resultsElement) resultsElement.style.display = "flex";
		renderer.setAnimationLoop(null); // Остановить цикл анимации;
		}
	
	// Другое транспортное средство сбивает игрока
	if (getDistance(playerHitZone2, secondplayerHitZone1) < 40) {
		if (resultsElement) resultsElement.style.display = "flex";
		renderer.setAnimationLoop(null); // Остановить цикл анимации;
		}
		console.log(hitplaer)
   }
}

function victory(){

	console.log(vido)
	if (playerpoints>=15 && vido==true) {
		if (victoryElement) victoryElement.style.display = "flex";
		renderer.setAnimationLoop(null); // Остановить цикл анимации
	}
}

window.addEventListener("resize", () => {
	console.log("resize", window.innerWidth, window.innerHeight);

	// Настройка камеры
	const newAspectRatio = window.innerWidth / window.innerHeight;
	const adjustedCameraHeight = cameraWidth / newAspectRatio;

	camera.top = adjustedCameraHeight / 2;
	camera.bottom = adjustedCameraHeight / -2;
	camera.updateProjectionMatrix(); //Должен быть вызван после изменения
	positionScoreElement();

	// Reset renderer// Сбросить средство визуализации
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.render(scene, camera);
});