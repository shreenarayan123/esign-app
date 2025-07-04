// main.js

// Global variable to store the uploaded file path
let uploadedFilePath = "";

/**
 * Shows a loader in the given element.
 * @param {string} elementId - The ID of the element to display the loader.
 * @param {string} message - An optional message to display.
 */
function showLoader(elementId, message = "Loading...") {
    document.getElementById(elementId).innerHTML = `<div class="loader"></div><p>${message}</p>`;
}

/**
 * Hides the loader in the given element.
 * @param {string} elementId - The ID of the element.
 */
function hideLoader(elementId) {
    document.getElementById(elementId).innerHTML = "";
}

/**
 * Uploads the selected PDF file and displays its preview.
 */
async function uploadFile() {
    const fileInput = document.getElementById('role1PdfFile');
    if (!fileInput.files.length) {
        alert('Please select a PDF file.');
        return;
    }
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    // Show loader in preview area
    showLoader('role1Preview', "Uploading file...");

    try {
        const response = await fetch('/esign/upload', {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();
        if (result.filename) {
            uploadedFilePath = 'uploads/' + result.filename;
            displayPreview(result.filename);
        } else {
            alert('Upload failed.');
            hideLoader('role1Preview');
        }
    } catch (error) {
        console.error(error);
        alert('Error during preview.');
        hideLoader('role1Preview');
    }
}

/**
 * Displays the PDF preview in an iframe.
 * @param {string} filename - The uploaded file's name.
 */
function displayPreview(filename) {
    const previewHTML = `<iframe src="/esign/preview/${filename}" width="100%" height="100%"></iframe>`;
    document.getElementById('role1Preview').innerHTML = previewHTML;
}

/**
 * Gathers form details and initiates the workflow by sending a payload to the backend.
 */
async function initiateWorkflow() {
    if (!uploadedFilePath) {
        alert('Please preview the PDF first.');
        return;
    }
    showLoader('initiateStatus', "Initialising workflow...");

    // Gather Role 1 details
    const role1Name = document.getElementById('role1Name').value;
    const role1Email = document.getElementById('role1Email').value;

    // Gather Role 2 details
    const role2Name = document.getElementById('role2Name').value;
    const role2Email = document.getElementById('role2Email').value;

    showLoader('initiateStatus', "Adding Signing Tags...");

    // Gather widget values for Role 2 (e.g., for Role 2's signature field)
    const r2_widget = {
        x: parseFloat(document.getElementById('r2-widgetX').value),
        y: parseFloat(document.getElementById('r2-widgetY').value),
        w: parseFloat(document.getElementById('r2-widgetW').value),
        h: parseFloat(document.getElementById('r2-widgetH').value),
        page: parseInt(document.getElementById('r2-widgetPage').value, 10),
    };

    // Gather widget values for Role 3 (e.g., for Role 3's signature field)
    const r3_widget = {
        x: parseFloat(document.getElementById('r3-widgetX').value),
        y: parseFloat(document.getElementById('r3-widgetY').value),
        w: parseFloat(document.getElementById('r3-widgetW').value),
        h: parseFloat(document.getElementById('r3-widgetH').value),
        page: parseInt(document.getElementById('r3-widgetPage').value, 10),
    };

    if (
        !role1Name ||
        !role1Email ||
        isNaN(r2_widget.x) ||
        isNaN(r2_widget.y) ||
        isNaN(r2_widget.w) ||
        isNaN(r2_widget.h) ||
        isNaN(r2_widget.page) ||
        isNaN(r3_widget.x) ||
        isNaN(r3_widget.y) ||
        isNaN(r3_widget.w) ||
        isNaN(r3_widget.h) ||
        isNaN(r3_widget.page)
    ) {
        alert('Please fill in all Role 1 and widget details.');
        return;
    }

    // Build the payload as expected by OpenSignLabs
    const payload = {
        filePath: uploadedFilePath,
        title: "Offer Letter",
        note: "sample Note",
        description: "sample Description",
        timeToCompleteDays: 15,
        signers: [
            {
                role: "Role3",
                name: "",
                email: "",
                phone: "",
                widgets: [
                    {
                        type: "signature",
                        page: r3_widget.page,
                        x: r3_widget.x,
                        y: r3_widget.y,
                        w: r3_widget.w,
                        h: r3_widget.h,
                    },
                ],
            },
            {
                role: "Role2",
                name: role2Name,
                email: role2Email,
                phone: "",
                widgets: [
                    {
                        type: "signature",
                        page: r2_widget.page,
                        x: r2_widget.x,
                        y: r2_widget.y,
                        w: r2_widget.w,
                        h: r2_widget.h,
                    },
                ],
            },
        ],
        folderId: "",
        send_email: true,
        email_subject: "",
        email_body: "",
        sendInOrder: true,
        enableOTP: false,
        enableTour: false,
        redirect_url: "",
        sender_name: "opensign™",
        sender_email: "mailer@opensignlabs.com",
        allow_modifications: false,
    };

    showLoader('initiateStatus', "Creating template...");

    try {
        const response = await fetch('/esign/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const result = await response.json();
        console.log(result);
        // Update status with the result message and template/document ID
        document.getElementById('initiateStatus').innerText =
            `${result.message} Template ID: ${result.objectId}.`;
        // Pre-fill the Template ID for Role 2 section
        document.getElementById('templateId').value = result.objectId;
    } catch (error) {
        console.error(error);
        document.getElementById('initiateStatus').innerText = 'Error during initiation.';
    }
}

/**
 * Handles Role 2 signing and updating Role 3 email.
 */
async function role2Sign() {
    const templateId = document.getElementById('templateId').value;
    const forRole = document.getElementById('forRole').value;
    const role3Email = document.getElementById('role3Email').value;
    const role3Name = document.getElementById('role3Name').value;
    const role3Phone = document.getElementById('role3Phone').value;
    if (!templateId || !role3Email) {
        alert('Please enter Template ID and Role 3 Email.');
        return;
    }
    const payload = {
        templateId: templateId,
        role: forRole,
        role3Email: role3Email,
        role3Name: role3Name,
        role3Phone: role3Phone,
    };
    showLoader('role2Status', "Updating Role 3 and creating signing document...");
    try {
        const response = await fetch('/esign/role2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const result = await response.json();

        // Find the signing URL for the Role 3 email (from input)
        const role2Email = document.getElementById('role2Email').value;
        const signObj = result.signurl.find(item => item.email === role2Email);
        const statusElem = document.getElementById('role2Status');
        statusElem.innerHTML = "";
        if (signObj) {
            const anchor = document.createElement("a");
            anchor.href = signObj.url;
            anchor.target = "_blank";
            anchor.textContent = "Click here to sign the document (Role 2)";
            statusElem.appendChild(anchor);
        } else {
            statusElem.innerText = "No signing URL found for " + desiredEmail;
        }

        // Also create a link for Role 3 signing
        const statusElemRole3 = document.getElementById('role3Status');
        statusElemRole3.innerHTML = "";
        const signObjRole3 = result.signurl.find(item => item.email === role3Email);
        if (signObjRole3) {
            const anchorRole3 = document.createElement("a");
            anchorRole3.href = signObjRole3.url;
            anchorRole3.target = "_blank";
            anchorRole3.textContent = "Click here to sign the document (Role 3)";
            statusElemRole3.appendChild(anchorRole3);
            const documentIdRole3 = document.getElementById('documentIdRole3');
            documentIdRole3.innerHTML = "";
            documentIdRole3.innerText = "Document ready.";
        } else {
            statusElemRole3.innerText = "No signing URL found for " + desiredEmail;
        }
    } catch (error) {
        console.error(error);
        document.getElementById('role2Status').innerText = 'Error during Role 2 signing.';
    }
}

/**
 * Initializes event listeners once the DOM content is loaded.
 */
function initEventListeners() {
    document.getElementById('role1PdfFile').addEventListener('change', uploadFile);
    document.getElementById('initiateBtn').addEventListener('click', initiateWorkflow);
    document.getElementById('role2SignBtn').addEventListener('click', role2Sign);
}

// Initialize listeners on DOM load
document.addEventListener('DOMContentLoaded', initEventListeners);
