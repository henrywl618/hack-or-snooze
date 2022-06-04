"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage(storyList.stories);
}

$body.on("click", "#nav-all", async()=>{
  //update the currentUser to get an updated list of favorites from the API
  storyList = await StoryList.getStories();
  navAllStories();
});

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updatNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide(); 
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** Shows the form to submit a new story */

function navShowSubmitForm(){
  hidePageComponents();
  $storyForm.show();
}

$navSubmit.on("click", navShowSubmitForm);

//favorites event handler
$('#nav-favorites').on('click', async ()=>{

  //update the currentUser to get an updated list of favorites from the API
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  currentUser = await User.loginViaStoredCredentials(token, username);
  hidePageComponents();
  putStoriesOnPage(currentUser.favorites);

});
