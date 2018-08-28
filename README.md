# UX4ML #
A user testing app to get user-validation on clusters generated using ML different algorithms. User validates which scatterplot is more clustered/clumpy.

Features:
* Allows users to  compare two scatterplot images side-by-side.
* Records time and keystroke (selected image).

Note:
* Run the app locally using any http server
* Place your input files in static/input folder
* Set the following parameters in static/js/app.js file:
&nbsp; *noOfUsers* - number of users taking the user study
&nbsp; *prefix* - if any, for each user_id and
&nbsp; *noOfImages* - number of total images for each ML algorithm
