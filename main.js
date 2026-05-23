const width = window.innerWidth
const height = window.innerHeight
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x090909);
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
camera.position.z = 32

const renderer = new THREE.WebGLRenderer({ antialias: true, stencil: true })
renderer.setSize(width, height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById("canvas-container").appendChild(renderer.domElement)

function createTextTexture(text, textColor) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font= "800 90px 'Trebuchet MS'"
    ctx.fillStyle = textColor;
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true
    return texture;
}

const bgGroup = new THREE.Group();
bgGroup.position.z = -20;
const bgPlaneGeo = new THREE.PlaneGeometry(60, 60);
const leftBgMesh = new THREE.Mesh(bgPlaneGeo, new THREE.MeshBasicMaterial({ color: 0x090909 }));
leftBgMesh.position.x = -30.3;
bgGroup.add(leftBgMesh)

const rightBgMesh = new THREE.Mesh(bgPlaneGeo, new THREE.MeshBasicMaterial({ color: 0xd30023 }));
rightBgMesh.position.x = 29.7;
bgGroup.add(rightBgMesh);

scene.add(bgGroup)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
scene.add(ambientLight)
const shadowLight = new THREE.DirectionalLight(0xffffff, 0.45);
shadowLight.position.set(2, 5, 12);
scene.add(shadowLight)

function createRoundedCardShape(w, h, r) {

    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 + r, -h / 2); 
    shape.lineTo(w / 2 - r, -h / 2); 
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); 
    shape.lineTo(w / 2, h / 2 - r); 
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); 
    shape.lineTo(-w / 2 + r, h / 2); 
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); 
    shape.lineTo(-w / 2, -h / 2 + r); 
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); 
    return shape; 

    }

const cardShape = createRoundedCardShape(11, 16, 0.8);

const cardGeo = new THREE.ExtrudeGeometry(cardShape, {
    depth: 0.15,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.04,
    bevelThickness: 0.04
}
);

cardGeo.center();
const hexGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(2, 3.46, 0),
    new THREE.Vector3(4, 0, 0),
    new THREE.Vector3(2, -3.46, 0),
    new THREE.Vector3(-2, -3.46, 0),
    new THREE.Vector3(-4, 0, 0),
    new THREE.Vector3(-2, 3.46, 0),
    new THREE.Vector3(2, 3.46, 0)
]
);

const textOverlayGeo = new THREE.PlaneGeometry(10, 10);

const cardContainer = new THREE.Group();
scene.add(cardContainer);

const layersCount =20; //30;

let hexaTextMat, grimTextMat;

const card1Group = new THREE.Group();

const maskMat1 = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
maskMat1.stencilWrite = true;
maskMat1.stencilRef = 1;
maskMat1.stencilFunc = THREE.AlwaysStencilFunc;
maskMat1.stencilFail = THREE.ReplaceStencilOp;
maskMat1.stencilZFail = THREE.ReplaceStencilOp;
maskMat1.stencilZPass = THREE.ReplaceStencilOp;

const maskMesh1 = new THREE.Mesh(new THREE.ShapeGeometry(cardShape), maskMat1);
maskMesh1.position.z = 0.01;
maskMesh1.renderOrder = 1;
card1Group.add(maskMesh1);

const cardMesh1 = new THREE.Mesh(cardGeo, new THREE.MeshLambertMaterial({ color: 0xd30023 }));
cardMesh1.renderOrder = 2;
card1Group.add(cardMesh1);

hexaTextMat = new THREE.MeshBasicMaterial({
    map: createTextTexture("HEXA", "#090909"),
    transparent: true,
    depthWrite: false
}
);

const hexaTextMesh = new THREE.Mesh(textOverlayGeo, hexaTextMat);
hexaTextMesh.position.set(0, 5.7, 0.2);
hexaTextMesh.renderOrder = 4;
card1Group.add(hexaTextMesh);

const tunnelGroup1 = new THREE.Group();

for (let i = 0; i < layersCount; i++) {
    const hexMat1 = new THREE.LineBasicMaterial({
        color: 0x090909,
        transparent: true,
        opacity: 1.0 - i * 0.08,
        depthTest: false
    }
);

    hexMat1.stencilWrite = true;
    hexMat1.stencilRef = 1;
    hexMat1.stencilFunc = THREE.EqualStencilFunc;

    const ringInnerGroup = new THREE.Group();

    for (let j = 0; j < 5; j++) {
        const hexLine = new THREE.LineLoop(hexGeo, hexMat1);
        hexLine.position.set(j * 0.02, j * 0.02, 0);
        ringInnerGroup.add(hexLine);
    }

    ringInnerGroup.position.z = -i * 2.2;
    ringInnerGroup.position.y = -i * 0.35;

    tunnelGroup1.add(ringInnerGroup);
}

tunnelGroup1.position.set(0, 0, 0.02);
tunnelGroup1.renderOrder = 3;
card1Group.add(tunnelGroup1);

card1Group.position.set(-5, 0, -2.5);
card1Group.rotation.set(-0.15, 0.70, 0.14);
cardContainer.add(card1Group);

const card2Group = new THREE.Group();

const maskMat2 = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
maskMat2.stencilWrite = true;
maskMat2.stencilRef = 2;
maskMat2.stencilFunc = THREE.AlwaysStencilFunc;
maskMat2.stencilFail = THREE.ReplaceStencilOp;
maskMat2.stencilZFail = THREE.ReplaceStencilOp;
maskMat2.stencilZPass = THREE.ReplaceStencilOp;

const maskMesh2 = new THREE.Mesh(new THREE.ShapeGeometry(cardShape), maskMat2);
maskMesh2.position.z = 0.01;
maskMesh2.renderOrder = 1;
card2Group.add(maskMesh2);

const cardMesh2 = new THREE.Mesh(cardGeo, new THREE.MeshLambertMaterial({ color: 0x090909 }));
cardMesh2.renderOrder = 2;
card2Group.add(cardMesh2);

grimTextMat = new THREE.MeshBasicMaterial({
    map: createTextTexture("GRIM", "#d30023"),
    transparent: true,
    depthWrite: false
}
);

const grimTextMesh = new THREE.Mesh(textOverlayGeo, grimTextMat);
grimTextMesh.position.set(0, 5.5, 0.2);
grimTextMesh.renderOrder = 999;
card2Group.add(grimTextMesh);

const tunnelGroup2 = new THREE.Group();

for (let i = 0; i < layersCount; i++) {
    const hexMat2 = new THREE.LineBasicMaterial({
        color: 0xd30023,
        transparent: true,
        opacity: 1.0 - i * 0.08,
        depthTest: false
    });

    hexMat2.stencilWrite = true;
    hexMat2.stencilRef = 2;
    hexMat2.stencilFunc = THREE.EqualStencilFunc;

    const ringInnerGroup = new THREE.Group();

    for (let j = 0; j < 5; j++) {
        const hexLine = new THREE.LineLoop(hexGeo, hexMat2);
        hexLine.position.set(j * 0.02, j * 0.02, 0);
        ringInnerGroup.add(hexLine);
    }

    ringInnerGroup.position.z = -i * 2.2;
    ringInnerGroup.position.y = -i * 0.35;

    tunnelGroup2.add(ringInnerGroup);
}

tunnelGroup2.position.set(0, 0, 0.02);
tunnelGroup2.renderOrder = 3;
card2Group.add(tunnelGroup2);

card2Group.position.set(4.8, 0, 0.5);
card2Group.rotation.set(-0.15, -0.42, -0.14);
cardContainer.add(card2Group);

let targetMouseX = 0, targetMouseY = 0, mouseX = 0, mouseY = 0;
let scrollProgress = 0, targetScrollProgress = 0;

window.addEventListener("mousemove", (e) => {
    targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
}
);

window.addEventListener("scroll", () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0) targetScrollProgress = window.scrollY / maxScroll;
}
);

document.fonts.ready.then(() => {
    hexaTextMat.map = createTextTexture("HEXA", "#090909");
    grimTextMat.map = createTextTexture("GRIM", "#d30023");
}
);

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    mouseX += (targetMouseX - mouseX) * 0.07;
    mouseY += (targetMouseY - mouseY) * 0.07;
    scrollProgress += (targetScrollProgress - scrollProgress) * 0.08;

    cardContainer.position.y = scrollProgress * 15;
    cardContainer.position.z = scrollProgress * -8;
    //ts for the cards rot and move anim thing
    card1Group.position.y = Math.sin(time * 1.2) * 0.25;
    card1Group.position.x = -5 - scrollProgress * 3;
    card1Group.rotation.y = 0.55 + mouseX * 0.15 + scrollProgress * 0.2;
    card1Group.rotation.x = -0.15 - mouseY * 0.1;

    card2Group.position.y = Math.sin(time * 1.2 + 1) * 0.25;
    card2Group.position.x = 4.8 + scrollProgress * 3;
    card2Group.rotation.y = -0.42 + mouseX * 0.15 - scrollProgress * 0.2;
    card2Group.rotation.x = -0.15 - mouseY * 0.1;
    renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
);