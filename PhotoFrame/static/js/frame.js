// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Empties the grid of images.
function clearPreview() {
  showPreview(null, null);
}

// Shows a grid of media items in the photo frame.
// The source is an object that describes how the items were loaded.
// The media items are rendered on screen in a grid, with a caption based
// on the description, model of the camera that took the photo and time stamp.
// Each photo is displayed through the fancybox library for full screen and
// caption support.
function showPreview(source, mediaItems, title) {
  $('#images-container').empty();

  
  // Display the length and the source of the items if set.
  if (source && mediaItems) {
    $('#title-frame').text("Fotos dels convidats de la "+ title);
    $('#images-count').text(mediaItems.length);
    $('#images-taula').text(title);
    $('#images-source').text(JSON.stringify(source));
    $('#preview-description').show();
  } else {
    $('#images-count').text(0);
    $('#images-source').text('No photo search selected');
    $('#preview-description').hide();
  }

  // Show an error message and disable the slideshow button if no items are
  // loaded.
  if (!mediaItems || !mediaItems.length) {
    $('#images_empty').show();
    $('#startSlideshow').prop('disabled', true);
  } else {
    $('#images_empty').hide();
    $('startSlideshow').removeClass('disabled');
  }

  // Loop over each media item and render it.
  $.each(mediaItems, (i, item) => {
    // Construct a thumbnail URL from the item's base URL at a small pixel size.
    const thumbnailUrl = `${item.baseUrl}=w256-h256`;
    // Constuct the URL to the image in its original size based on its width and
    // height.

    var fullUrl="";
    if(typeof item.mediaMetadata.video == 'undefined'){
       fullUrl = `${item.baseUrl}=w${item.mediaMetadata.width}-h${
        item.mediaMetadata.height}`;
    }else{
       fullUrl = `${item.baseUrl}=dv`;
    }
    // Compile the caption, conisting of the description, model and time.
    const description = item.description ? item.description : '';
    var model ="";
    try{
       model = item.mediaMetadata.photo.cameraModel ?
        `#Shot on ${item.mediaMetadata.photo.cameraModel}` :
        '';
      }catch(err){
        //console.log("item", item);
         model = "#Shot on a video camera";
      }
    const time = item.mediaMetadata.creationTime;
    const captionText = `${description} ${model} (${time})`

    // Each image is wrapped by a link for the fancybox gallery.
    // The data-width and data-height attributes are set to the
    // height and width of the original image. This allows the
    // fancybox library to display a scaled up thumbnail while the
    // full sized image is being loaded.
    // The original width and height are part of the mediaMetadata of
    // an image media item from the API.
    const linkToFullImage = $('<a />')
                                .attr('href', fullUrl)
                                .attr('data-fancybox', 'gallery')
                                .attr('data-width', item.mediaMetadata.width)
                                .attr('data-height', item.mediaMetadata.height);
    // Add the thumbnail image to the link to the full image for fancybox.
    const thumbnailImage = $('<img />')
                               .attr('src', thumbnailUrl)
                               .attr('alt', captionText)
                               .addClass('img-fluid rounded thumbnail');
    linkToFullImage.append(thumbnailImage);

    // The caption consists of the caption text and a link to open the image
    // in Google Photos.
    const imageCaption =
        $('<figcaption />').addClass('hidden').text(captionText);
    const linkToGooglePhotos = $('<a />')
                                   .attr('href', item.productUrl)
                                   .text('[Click to open in Google Photos]');
    imageCaption.append($('<br />'));
    imageCaption.append(linkToGooglePhotos);
    linkToFullImage.append(imageCaption);

    // Add the link (consisting of the thumbnail image and caption) to
    // container.
    $('#images-container').append(linkToFullImage);
  });
};

// Makes a backend request to display the queue of photos currently loaded into
// the photo frame. The backend returns a list of media items that the user has
// selected. They are rendered in showPreview(..).
function loadQueue() {
  showLoadingDialog();
  $.ajax({
    type: 'GET',
    url: '/getQueue',
    dataType: 'json',
    data:{'album':"album"},
    success: (data) => {
      // Queue has been loaded. Display the media items as a grid on screen.
      //console.log("data received:", data);
      hideLoadingDialog();

      if(Object.keys(data).length!=0){
        data.photos.sort(function(a,b){
          return  new Date(b.mediaMetadata.creationTime) - new Date(a.mediaMetadata.creationTime);
        });
    }


      //console.log("typeof:", data.length);
      showPreview(data.parameters, data.photos,data.title);
      if(Object.keys(data).length==0){
        //console.log("empty");
        var fileInput = document.getElementById('label-file-input');
        fileInput.style.display="none";
      }
      //console.log("data parameters:", data);
      hideLoadingDialog();
      console.log('Loaded queue.');
    },
    error: (data) => {
      hideLoadingDialog();
      handleError('Could not load queue', data)
    }
  });

  document.getElementById('reloadFrame').style.display="none";
}

  

$(document).ready(() => {
  // Load the queue of photos selected by the user for the photo
  loadQueue();

  
  // Set up the fancybox image gallery.
  $().fancybox({
    selector: '[data-fancybox="gallery"]',
    loop: true,
    buttons: ['slideShow', 'fullScreen', 'close', 'download'],
    image: {preload: true},
    transitionEffect: 'fade',
    transitionDuration: 1000,
    fullScreen: {autoStart: false},
    // Automatically advance after 3s to next photo.
    slideShow: {autoStart: true, speed: 5000},
    // Display the contents figcaption element as the caption of an image
    /*caption: function(instance, item) {
      return $(this).find('figcaption').html();
    }*/

  });

  // Clicking the 'view fullscreen' button opens the gallery from the first
  // image.
  $('#startSlideshow')
      .on('click', (e) => $('#images-container a').first().click());

  $('#changeAlbum').on('click',(e) => window.location ='/album');
  // Clicking log out opens the log out screen.
  $('#logout').on('click', (e) => {
    window.location = '/logout';
  });

  $('#reloadFrame').on('click',(e) =>loadQueue());

  // File catcher
  var fileCatcher = document.getElementById('file-catcher');
  var fileInput = document.getElementById('file-input');

  var fileList = [];
  var renderFileList, sendFile;

  fileInput.addEventListener('change', function(evnt){
    fileList = [];
    for(var i=0; i< fileInput.files.length; i++){
      //fileList.push(fileInput.files[i]);
      sendFile(fileInput.files[i]);
    }
    //console.log("File list:", fileList);
    });



// ask for reload
  setInterval(()=>{$.ajax({
    type: 'GET',
    url: '/newFiles',
    dataType: 'json',
    data:{'album':document.getElementById('images-source').textContent, 'time':new Date().getTime(), 'number':document.getElementById('images-count').textContent},
    processData: true,
    success: (data) => {
      // Queue has been loaded. Display the media items as a grid on screen.
      //console.log("data received:", data);
      //console.log("date:", new Date().getTime());
      //console.log("album:",document.getElementById('images-source').textContent );
      if(data.result != false){
        document.getElementById('reloadFrame').style.display="block";
        //console.log("data.result:", data.result);
        document.getElementById('fotos-noves').textContent = data.result +" fotos noves!";
      }else{
        document.getElementById('reloadFrame').style.display="none";
        //document.getElementById('fotos-noves').textContent = new Date().getTime();
      }
      
    },
    error: (data) => {
      hideLoadingDialog();
      handleError('Could not load queue', data)
    }})}, 10000);


  // Function declaration
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