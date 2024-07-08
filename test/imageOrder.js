// script.js

document.getElementById('file-upload').addEventListener('change', handleImageUpload);
const imageContainer = document.getElementById('imageContainer');
let filesArray = [];

function handleImageUpload(event) {
    const files = event.target.files;
    for (let file of files) {
        const uniqueFile = {
            file: file,
            uniqueId: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        filesArray.push(uniqueFile);
        addFileToContainer(uniqueFile);
    }
}

function addFileToContainer(uniqueFile) {
    const imageWrapper = document.createElement('li');
    imageWrapper.classList.add('imageWrapper');
    imageWrapper.draggable = true;
    imageWrapper.textContent = uniqueFile.file.name;
    imageWrapper.dataset.uniqueId = uniqueFile.uniqueId;
    imageContainer.appendChild(imageWrapper);
}

// Initialize Sortable.js
new Sortable(imageContainer, {
    animation: 150,
    onEnd: updateFilesArray
});

function updateFilesArray() {
    let updatedArray = [];
    let allWrappers = [...imageContainer.querySelectorAll('.imageWrapper')];
    for (let wrapper of allWrappers) {
        let uniqueId = wrapper.dataset.uniqueId;
        let uniqueFile = filesArray.find(f => f.uniqueId === uniqueId);
        if (uniqueFile) {
            updatedArray.push(uniqueFile);
        }
    }
    filesArray = updatedArray;
}
