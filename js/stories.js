"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;


/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage(storyList.stories);
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  
  //Create a Set with the IDs of the users current favorite stories
  let favoriteIDs = new Set(currentUser.favorites.map( function(element){return element.storyId}));

  const hostName = story.getHostName();

  //If this story is favorited, create the list item with a filled in heart icon
  if(favoriteIDs.has(`${story.storyId}`)){
    return $(`
      <li id="${story.storyId}">
        <i class="fa-solid fa-heart"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        <a class='storyBtn' id='editBtn' data-toggle="modal" data-target="#editStoryModal"><small>edit</small></a>
        <a class='storyBtn' id='removeBtn'><small>remove</small></a>
      </li>
    `);
  }
  //If it's not favorited the list item will have the hollow heart icon
  return $(`
      <li id="${story.storyId}">
        <i class="fa-regular fa-heart"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        <a class='storyBtn' id='editBtn' data-toggle="modal" data-target="#editStoryModal"><small>edit</small></a>
        <a class='storyBtn' id='removeBtn'><small>remove</small></a>
      </li>
    `);
}

//Function to favorite click event
async function favoriteStory(){
  // Stores the IDs of the current users favorite stories
  const isThisFavorited = $(this).hasClass('fa-solid');
  //get the storyID from the parent LI
  const storyID = $(this).parent().attr('id');

  if(!isThisFavorited){
    await User.addFavorite(currentUser, storyID);
  } else {
    await User.removeFavorite(currentUser, storyID);
  }

  $(this).toggleClass(['fa-regular','fa-solid']);
}

//on click handler for favorite icon
$allStoriesList.on('click','i', favoriteStory);


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage(list) {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of list) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

//Submits the story to the API using inputs from the submit form

async function submitStory(evt){
  evt.preventDefault();
  const title = $('#story-title').val();
  const author = $('#story-author').val();
  const url = $('#story-url').val();

  await StoryList.addStory(currentUser,{author,title,url});
  $storyForm.trigger("reset");
  location.reload();
}

$storyForm.on('submit',submitStory);


/** Removes a story from the DOM and API
 * 
 */

async function removeStory(){
  //get the storyID from the parent LI  
  const storyID = $(this).parent().attr('id');

  try{
    await axios({
      method:'delete',
      url: `https://hack-or-snooze-v3.herokuapp.com/stories/${storyID}`,
      data: {
        token: currentUser.loginToken,
      }
    })
  }
  catch(error){
    return error;
  }
  $(this).parent().remove();
}

//Click handler for the remove button
$allStoriesList.on('click','#removeBtn', removeStory);

/**Send an API request to update a story
 * 
 * storyID = string
 * editObj = Object containing the story properties being edited {author, title, url}
 * 
*/
async function editStory(storyID,editObj){
  await axios({
    method: 'patch',
    url: `https://hack-or-snooze-v3.herokuapp.com/stories/${storyID}`,
    data:{
      token: currentUser.loginToken,
      story:{...editObj}
    }
  })
}

/**Takes values from the Edit Form and sends an edit story API request
 * 
 * 
 */

async function editStorySubmit(){
  const storyID = $editForm.data('storyID');
  let storyEdits = {};
  const title = $('#edit-story-title').val();
  const author = $('#edit-story-author').val();
  const url = $('#edit-story-url').val();

  //only add in values in the form that are not empty. Values will be falsey if its an empty string
  //values added in via destructuring
  if(title) storyEdits = {...storyEdits,title};
  if(author) storyEdits = {...storyEdits,author};
  if(url) storyEdits = {...storyEdits,url};
  //send API request to edit story
  await editStory(storyID,storyEdits);
  //refresh the page to show edits
  location.reload();
}

//Clicking the edit button will update the Edit Form to have an ID equal to the storyID for the parent LI
$allStoriesList.on('click','#editBtn', function(){
  //get the story ID of the parent LI
  const storyID = $(this).parent().attr('id');
  //set the Edit Form ID
  $editForm.data('storyID', storyID);
});


// Event handler for submitting the edit form
$editForm.on('submit',editStorySubmit);