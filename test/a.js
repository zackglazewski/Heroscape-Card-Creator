document.addEventListener('DOMContentLoaded', function() {
    const imageUpload = document.getElementById('imageUpload');
    const imageList = document.getElementById('imageList');
    const imageCanvas = document.getElementById('imageCanvas');
    const deleteImageButton = document.getElementById('deleteImage');
    const ctx = imageCanvas.getContext('2d');

    let images = [];
    let selectedImageIndex = -1;

    imageUpload.addEventListener('change', handleImageUpload);

    function handleImageUpload(event) {
        const files = event.target.files;
        for (let file of files) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.src = e.target.result;
                img.onload = function() {
                    images.push({ img: img, x: 0, y: 0, scale: 1 });
                    addImageToList(file.name);
                    renderCanvas();
                };
            };
            reader.readAsDataURL(file);
        }
    }

    function addImageToList(name) {
        const li = document.createElement('li');
        li.textContent = name;
        imageList.appendChild(li);
        $(li).draggable({
            revert: true,
            helper: "clone"
        }).sortable({
            update: function(event, ui) {
                const newIndex = $(ui.item).index();
                const oldIndex = $(ui.item).data('index');
                moveImage(oldIndex, newIndex);
                $(ui.item).data('index', newIndex);
                renderCanvas();
            }
        });
        li.addEventListener('click', () => {
            selectedImageIndex = Array.from(imageList.children).indexOf(li);
            highlightSelectedImage();
        });
    }

    function moveImage(oldIndex, newIndex) {
        const [movedImage] = images.splice(oldIndex, 1);
        images.splice(newIndex, 0, movedImage);
    }

    function highlightSelectedImage() {
        Array.from(imageList.children).forEach((li, index) => {
            if (index === selectedImageIndex) {
                li.style.backgroundColor = '#d0d0d0';
            } else {
                li.style.backgroundColor = '#f0f0f0';
            }
        });
    }

    function renderCanvas() {
        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
        images.forEach((image) => {
            ctx.drawImage(image.img, image.x, image.y, image.img.width * image.scale, image.img.height * image.scale);
        });
    }

    imageCanvas.addEventListener('mousedown', function(event) {
        if (selectedImageIndex >= 0) {
            const image = images[selectedImageIndex];
            const offsetX = event.offsetX - image.x;
            const offsetY = event.offsetY - image.y;

            function onMouseMove(e) {
                image.x = e.offsetX - offsetX;
                image.y = e.offsetY - offsetY;
                renderCanvas();
            }

            function onMouseUp() {
                imageCanvas.removeEventListener('mousemove', onMouseMove);
                imageCanvas.removeEventListener('mouseup', onMouseUp);
            }

            imageCanvas.addEventListener('mousemove', onMouseMove);
            imageCanvas.addEventListener('mouseup', onMouseUp);
        }
    });

    imageCanvas.addEventListener('wheel', function(event) {
        if (selectedImageIndex >= 0) {
            const image = images[selectedImageIndex];
            const scaleAmount = event.deltaY < 0 ? 1.1 : 0.9;
            image.scale *= scaleAmount;
            renderCanvas();
        }
    });

    deleteImageButton.addEventListener('click', function() {
        if (selectedImageIndex >= 0) {
            images.splice(selectedImageIndex, 1);
            imageList.removeChild(imageList.children[selectedImageIndex]);
            selectedImageIndex = -1;
            highlightSelectedImage();
            renderCanvas();
        }
    });
});
