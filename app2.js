try {
    Storage.put(result, 'File content', {
      progressCallback(progress) {
          console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
    },
    });
  } catch (error) {
    console.log(error);
  }

  setImage(result);
  console.log(result);
  if (!result.cancelled) {
    setImage(result.uri);
  }
};