const checkInButton = document.getElementById("checkInBtn");
const checkOutButton = document.getElementById("checkOutBtn");
const resetButton = document.getElementById("resetBtn");
const workedHoursElement = document.getElementById("workedHours");
const logTableBody = document.querySelector("#logTable tbody");

let entryTime = null;
let exitTime = null;

// Helper function to calculate time difference in hours and minutes
function calculateTimeDifference(entry, exit) {
  const entryDate = new Date(entry);
  const exitDate = new Date(exit);

  const diffInMilliseconds = exitDate - entryDate;
  const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60)); // Full hours
  const minutes = Math.floor(
    (diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
  ); // Remaining minutes

  return { hours, minutes };
}

// Save log to localStorage
function saveLog(log) {
  let logs = JSON.parse(localStorage.getItem("logs")) || [];
  logs.push(log);
  localStorage.setItem("logs", JSON.stringify(logs));
}

// Display logs in the table
function displayLogs() {
  const logs = JSON.parse(localStorage.getItem("logs")) || [];
  logTableBody.innerHTML = ""; // Clear current table content

  logs.forEach((log) => {
    const { hours, minutes } = calculateTimeDifference(log.entry, log.exit);
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${log.date}</td>
            <td>${new Date(log.entry).toLocaleTimeString()}</td>
            <td>${new Date(log.exit).toLocaleTimeString()}</td>
            <td>${hours} hours ${minutes} minutes</td>
        `;
    logTableBody.appendChild(row);
  });
}

// Check-In button logic
checkInButton.addEventListener("click", function () {
  const now = new Date();
  entryTime = now.toISOString(); // Store entry time in ISO format

  // Store entry time in localStorage
  localStorage.setItem("entryTime", entryTime);

  // Disable Check-In and enable Check-Out after 1 minute
  checkInButton.disabled = true;
  checkOutButton.disabled = false;

  // Update worked hours display
  workedHoursElement.textContent = "Worked: 0 hours 0 minutes"; // Reset worked time when checking in

  // Set a timer to enable the Check-Out button after 1 minute
  setTimeout(() => {
    checkOutButton.disabled = false;
  }, 1 * 60 * 1000); // 1 minute (in milliseconds)

  alert("You have successfully checked in at " + now.toLocaleTimeString());
});

// Check-Out button logic
checkOutButton.addEventListener("click", function () {
  if (!entryTime) {
    alert("You must check-in first.");
    return;
  }

  const now = new Date();
  exitTime = now.toISOString(); // Store exit time in ISO format

  // Calculate worked hours
  const { hours, minutes } = calculateTimeDifference(entryTime, exitTime);

  // Display worked hours
  workedHoursElement.textContent = `Worked: ${hours} hours ${minutes} minutes`;

  // Save the log to localStorage
  const currentDate = new Date().toLocaleDateString(); // Get the current date
  const log = {
    date: currentDate,
    entry: entryTime,
    exit: exitTime,
    worked: `${hours} hours ${minutes} minutes`,
  };
  saveLog(log);

  // Reset localStorage for entryTime after check-out
  localStorage.removeItem("entryTime");

  // Disable Check-Out and enable Check-In for the next day
  checkInButton.disabled = false;
  checkOutButton.disabled = true;

  alert(
    `You have successfully checked out at ${now.toLocaleTimeString()}. You worked for ${hours} hours ${minutes} minutes.`
  );

  // Display the updated log table
  displayLogs();
});

// Reset button logic
resetButton.addEventListener("click", function () {
  // Clear all data from localStorage
  localStorage.removeItem("entryTime");
  localStorage.removeItem("logs");

  // Reset the UI
  checkInButton.disabled = false;
  checkOutButton.disabled = true;
  workedHoursElement.textContent = "Worked: 0 hours 0 minutes";

  // Clear the log table
  logTableBody.innerHTML = "";

  alert("All data has been reset.");
});

// On page load: check if user has checked in (i.e., entryTime exists in localStorage)
window.onload = function () {
  const savedEntryTime = localStorage.getItem("entryTime");
  if (savedEntryTime) {
    entryTime = savedEntryTime;
    checkInButton.disabled = true; // Disable Check-In button after check-in
    checkOutButton.disabled = false; // Enable Check-Out button
  }

  // Display the log table
  displayLogs();
};
