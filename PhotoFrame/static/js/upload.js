
/*
NO FUNCIONA DE ESTA FORMA
function renderFileList() {
    fileListDisplay.innerHTML = '';
    fileList.forEach(function (file, index) {
        var fileDisplayEl = document.createElement('p');
      fileDisplayEl.innerHTML = (index + 1) + ': ' + file.name;
      fileListDisplay.appendChild(fileDisplayEl);
    });
  }
  
function sendFile(file) {
    var formData = new FormData();
    var request = new XMLHttpRequest();
    console.log("uploading:", file);
    formData.set('file', file);
    request.open("POST", 'https://jsonplaceholder.typicode.com/photos');
    request.send(formData);
  }

*/


$(document).ready(() => {
    var fileCatcher = document.getElementById('file-catcher');
  var fileInput = document.getElementById('file-input');
  var fileListDisplay = document.getElementById('file-list-display');
  
  var fileList = [];
  var renderFileList, sendFile;
  
  fileCatcher.addEventListener('submit', function (evnt) {
    evnt.preventDefault();
    fileList.forEach(function (file) {
        sendFile(file);
    });
  });
  
  fileInput.addEventListener('change', function (evnt) {
        fileList = [];
    for (var i = 0; i < fileInput.files.length; i++) {
        fileList.push(fileInput.files[i]);
    }
    renderFileList();
  });

   renderFileList = function () {
    fileListDisplay.innerHTML = '';
    fileList.forEach(function (file, index) {
      var fileDisplayEl = document.createElement('p');
      fileDisplayEl.innerHTML = (index + 1) + ': ' + file.name;
      fileListDisplay.appendChild(fileDisplayEl);
    });
  };
  
  sendFile = function (file) {
   /* var formData = new FormData();
    var request = new XMLHttpRequest();
 
    formData.set('file', file);
    request.open("POST", 'https://jsonplaceholder.typicode.com/photos');
    request.send(formData);
*/
  console.log("uploading");
  showLoadingDialog();
    var formData = new FormData();
    var request = new XMLHttpRequest();
 
    //formData.set('file', file);
    formData.append('photos[]', file, file.name);
  $.ajax({
    type: 'POST',
    url: '/uploadFile',
    processData: false, // required
    contentType: false, // required
    //dataType: 'json',
    data: formData,
    success: (data) => {
      //console.log('Albums imported:' + JSON.stringify(data.parameters));
      console.log("Photo uploaded");
      /*if (data.photos && data.photos.length) {
        // Photos were loaded from the album, open the photo frame preview
        // queue.
        window.location = '/frame'; // TODO: changed '/'
      } else {
        // No photos were loaded. Display an error.
        handleError('Couldn\'t import album', 'Album is empty.');
      } */
      hideLoadingDialog();
    },
    error: (data) => {
      handleError('Couldn\'t upload photo', data);
    }
  });


  };
});
  
