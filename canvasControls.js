const imageUploader = document.getElementById('imageUploader');
const canvas = document.getElementById('image-layer');
const input_canvas = document.getElementById('input-layer');
const ctx = canvas.getContext('2d');
const increaseScale = document.getElementById('increaseScale');
const decreaseScale = document.getElementById('decreaseScale');
const imageList = document.getElementById('imageList');

let currentImg = new Image();
let imgX = 0;
let imgY = 0;
let scale = 1;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let selectedImageIndex = -1;

let imagesToPlace = [];

function uploadImageManually(filename) {
    // Create a new Image instance
    const newImg = new Image();
    
    // Set up the onload event to process the image once it is loaded
    newImg.onload = () => {
        currentImg = newImg;

        const aspectRatio = currentImg.width / currentImg.height;

        currentImg.width = 500;
        currentImg.height = currentImg.width / aspectRatio;

        imgX = canvas.width / 2 + 270;
        imgY = canvas.height / 2 - 150;
        
        imagesToPlace.push({
            img: currentImg,
            x: imgX,
            y: imgY,
            scale: 1,
            aspectRatio: aspectRatio,
            name: filename
        });

        updateImageList();
        drawAllImages();
        resetControls();

        // Automatically select the uploaded image
        selectImage(imagesToPlace.length - 1, { offsetX: imgX, offsetY: imgY });
    };
    
    // Set the source of the image to the filename (URL or path)
    newImg.src = filename;
}


imageUploader.addEventListener('change', (event) => {
    const files = event.target.files;
    if (files.length > 0) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const newImg = new Image();
            newImg.onload = () => {
                currentImg = newImg;
                
                
                const aspectRatio = currentImg.width / currentImg.height;

                currentImg.width = 450;
                currentImg.height = currentImg.width / aspectRatio;

                imgX = canvas.width / 2 + 220;
                imgY = canvas.height / 2 - 150;
                imagesToPlace.push({img: currentImg, x: imgX, y: imgY, scale: 1, aspectRatio: aspectRatio, name: files[0].name});
                updateImageList();
                drawAllImages();
                resetControls();
                // Automatically select the uploaded image
                selectImage(imagesToPlace.length - 1, { offsetX: imgX, offsetY: imgY });
                // Clear the file input
                imageUploader.value = "";
            };
            newImg.src = e.target.result;
        };
        reader.readAsDataURL(files[0]);
    }
});

increaseScale.addEventListener('click', () => {
    adjustScale(1);
});

decreaseScale.addEventListener('click', () => {
    adjustScale(-1);
});

function adjustScale(delta) {
    if (selectedImageIndex >= 0) {
        const image = imagesToPlace[selectedImageIndex];
        image.scale = Math.max(0.1, image.scale + (delta*0.1));

        drawAllImages();
    }
}

function drawAllImages() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas
    imagesToPlace.forEach(image => {
        const {img, x, y, scale, aspectRatio} = image;
        const newWidth = img.width * scale;
        const newHeight = newWidth / aspectRatio;
        ctx.drawImage(img, x - (newWidth / 2), y - (newHeight / 2), newWidth, newHeight);
    });
}

function resetControls() {
    scale = 1;
}

function updateImageList() {
    imageList.innerHTML = '';
    imagesToPlace.forEach((image, index) => {
        const li = document.createElement('li');
        li.textContent = image.name;
        li.setAttribute('data-index', index);
        console.log("updateImageList");
        li.addEventListener('mousedown', (e) => selectImageFromList(e));
        
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            removeImageFromList(e);
        });
        
        li.appendChild(removeButton);
        imageList.appendChild(li);
    });

    new Sortable(imageList, {
        onEnd: function (evt) {
            const movedItem = imagesToPlace.splice(evt.oldIndex, 1)[0];
            imagesToPlace.splice(evt.newIndex, 0, movedItem);
            drawAllImages();
            updateSelectedImageIndex();
        }
    });
}

function selectImageFromList(e) {
    const li = e.currentTarget;
    const index = Array.from(li.parentNode.children).indexOf(li);
    selectImage(index, e);
}

function removeImageFromList(e) {
    const li = e.currentTarget.parentNode;
    const index = Array.from(li.parentNode.children).indexOf(li);
    imagesToPlace.splice(index, 1);
    updateImageList();
    drawAllImages();
}

function updateSelectedImageIndex() {
    if (selectedImageIndex >= 0) {
        const listItems = Array.from(imageList.children);
        selectedImageIndex = listItems.findIndex(item => item.classList.contains('selected'));
    }
}


function selectImage(index, e) {
    console.log("index: " + index);
    selectedImageIndex = index;
    const image = imagesToPlace[index];
    imgX = image.x;
    imgY = image.y;
    scale = image.scale;
    currentImg = image.img;
    drawAllImages();
    dragOffsetX = e.offsetX - imgX;
    dragOffsetY = e.offsetY - imgY;

    const listItems = imageList.getElementsByTagName('li');
    for (let item of listItems) {
        item.classList.remove('selected');
    }
    const selectedItem = listItems[index];
    selectedItem.classList.add('selected');
}

function removeImage(index) {
    imagesToPlace.splice(index, 1);
    updateImageList();
    drawAllImages();
}

const getTouchPos = (canvas, touchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const touch = touchEvent.touches[0];
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
};

input_canvas.addEventListener('mousedown', (e) => {
    if (selectedImageIndex >= 0) {
        const image = imagesToPlace[selectedImageIndex];
        isDragging = true;
        dragOffsetX = e.offsetX - image.x;
        dragOffsetY = e.offsetY - image.y;
    }
});

input_canvas.addEventListener('mousemove', (e) => {
    if (isDragging && selectedImageIndex >= 0) {
        const image = imagesToPlace[selectedImageIndex];
        imgX = e.offsetX - dragOffsetX;
        imgY = e.offsetY - dragOffsetY;
        image.x = imgX;
        image.y = imgY;
        drawAllImages();
    }
});

input_canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

input_canvas.addEventListener('mouseleave', () => {
    isDragging = false;
});

input_canvas.addEventListener('touchstart', (e) => {
    if (selectedImageIndex >= 0) {
        const pos = getTouchPos(input_canvas, e);
        const image = imagesToPlace[selectedImageIndex];
        isDragging = true;
        dragOffsetX = pos.x - image.x;
        dragOffsetY = pos.y - image.y;
    }
    e.preventDefault(); // Prevent scrolling when touching the canvas
});

input_canvas.addEventListener('touchmove', (e) => {
    if (isDragging && selectedImageIndex >= 0) {
        const pos = getTouchPos(input_canvas, e);
        const image = imagesToPlace[selectedImageIndex];
        imgX = pos.x - dragOffsetX;
        imgY = pos.y - dragOffsetY;
        image.x = imgX;
        image.y = imgY;
        drawAllImages();
    }
    e.preventDefault(); // Prevent scrolling when touching the canvas
});

input_canvas.addEventListener('touchend', () => {
    isDragging = false;
});

input_canvas.addEventListener('touchcancel', () => {
    isDragging = false;
});
