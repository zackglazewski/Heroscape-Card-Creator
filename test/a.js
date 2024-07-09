document.getElementById('saveButton').addEventListener('click', async () => {
    // Your dictionary object
    const dictionary = {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3'
    };

    // Convert dictionary to JSON string
    const jsonString = JSON.stringify(dictionary, null, 2);

    try {
        // Show the file save dialog
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: 'dictionary.json',
            types: [{
                description: 'JSON Files',
                accept: {'application/json': ['.json']}
            }]
        });

        // Create a writable stream
        const writableStream = await fileHandle.createWritable();
        
        // Write the JSON string to the file
        await writableStream.write(jsonString);
        
        // Close the file and write the contents to disk
        await writableStream.close();

        console.log('File saved successfully.');
    } catch (err) {
        console.error('Error saving file:', err);
    }
});
