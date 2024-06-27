// script.js
document.addEventListener("DOMContentLoaded", function () {
  var url = new URL(window.location.href);
  var pid = url.searchParams.get("pid");
  if (pid) {
    var appUrl = "kapadumapp://productdetails?pid=" + pid;
    // var appUrl = "https://example.com";
    // var fallbackUrl = "https://yourwebsite.com/productdetails?pid=" + pid; // Change this to your actual fallback URL

    // Attempt to open the app
    window.location.href = appUrl;

    // Fallback to the web URL after a delay
    // setTimeout(function () {
    //   window.location.href = fallbackUrl;
    // }, 500); // Adjust the delay as necessary
  } else {
    document.getElementById("error").textContent = "Product ID not found.";
  }
});
