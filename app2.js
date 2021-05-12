async function pathToImageFile() {
    try {
      const response = await fetch(result);
      const blob = await response.blob();
      await Storage.put(result, blob, {
        contentType: 'image/jpeg', // contentType is optional
      });
    } catch (err) {
      console.log('Error uploading file:', err);
    }
  }