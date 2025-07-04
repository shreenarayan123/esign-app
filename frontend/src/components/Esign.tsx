import React, { useState, type ChangeEvent, type ReactNode } from 'react';

const ESignWorkflow: React.FC = () => {
  const [uploadedFilePath, setUploadedFilePath] = useState<string>('');
  const [role1File, setRole1File] = useState<File | null>(null);

  const [role1Name, setRole1Name] = useState<string>('Shreenarayan');
  const [role1Email, setRole1Email] = useState<string>('shreenarayan@gmail.com');

  const [role2Name, setRole2Name] = useState<string>('');
  const [role2Email, setRole2Email] = useState<string>('');

  const [role3Name, setRole3Name] = useState<string>('');
  const [role3Email, setRole3Email] = useState<string>('');
  const [role3Phone, setRole3Phone] = useState<string>('');

  const [templateId, setTemplateId] = useState<string>('');
  const [role2Status, setRole2Status] = useState<ReactNode>('');
  const [role3Status, setRole3Status] = useState<ReactNode>('');
  const [documentIdRole3, setDocumentIdRole3] = useState<string>('Waiting for Document to be Prepared by Role 2');

  const [initiateStatus, setInitiateStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const r2Widget = {
    x: 35.11656207598372,
    y: 449.2039518317504,
    w: 150,
    h: 60,
    page: 1,
  };

  const r3Widget = {
    x: 383.506105834464,
    y: 449.65943012211676,
    w: 145.31886024423338,
    h: 58.12754409769335,
    page: 1,
  };

 
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRole1File(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!role1File) {
      alert('Please select a PDF file.');
      return;
    }

    setIsLoading(true);
    setInitiateStatus('Uploading file...');

    try {
      const formData = new FormData();
      formData.append('file', role1File);

      const response = await fetch('http://localhost:3000/esign/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.filename) {
        setUploadedFilePath(  result.filename);
        console.log('File uploaded:', uploadedFilePath, result.filename);
        setInitiateStatus('File uploaded successfully!');
      } else {
        alert('Upload failed.');
      }
    } catch (error) {
      console.error(error);
      alert('Error during upload.');
    }

    setIsLoading(false);
  };

  const initiateWorkflow = async () => {
    if (!uploadedFilePath) {
      alert('Please upload and preview the PDF first.');
      return;
    }

    setIsLoading(true);
    setInitiateStatus('Creating template...');
    console.log('Uploaded file path:', uploadedFilePath);
    const payload = {
      filePath: `uploads/${uploadedFilePath}`,
      title: "Important Document",
      note: "Hello, please sign this document.",
      description: "This is a test document for e-signature workflow.",
      timeToCompleteDays: 15,
      signers: [
        {
          role: "Role3",
          name: "",
          email: "",
          phone: "",
          widgets: [
            { type: "signature", ...r3Widget },
          ],
        },
        {
          role: "Role2",
          name: role2Name,
          email: role2Email,
          phone: "",
          widgets: [
            { type: "signature", ...r2Widget },
          ],
        },
      ],
      send_email: true,
      sendInOrder: true,
      enableOTP: false,
      enableTour: false,
      sender_name: "opensign™",
      sender_email: "mailer@opensignlabs.com",
      allow_modifications: false,
    };

    try {
      const response = await fetch('http://localhost:3000/esign/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      setTemplateId(result.objectId);
      setInitiateStatus(`${result.message} Template ID: ${result.objectId}.`);
    } catch (error) {
      console.error(error);
      setInitiateStatus('Error during initiation.');
    }

    setIsLoading(false);
  };

  const role2Sign = async () => {
    if (!templateId || !role3Email) {
      alert('Please enter Template ID and Role 3 Email.');
      return;
    }

    setIsLoading(true);
    setRole2Status('Updating Role 3 and creating signing document...');

    const payload = {
      templateId,
      role: "Role3",
      role3Email,
      role3Name,
      role3Phone,
    };

    try {
      const response = await fetch('http://localhost:3000/esign/role2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      // Role 2 link
      const role2Link = result.signurl.find((item: { email: string }) => item.email === role2Email);
      setRole2Status(role2Link ? (
        <a className="text-blue-600 underline" href={role2Link.url} target="_blank" rel="noopener noreferrer">
          Click here to sign the document (Role 2)
        </a>
      ) : "No signing URL found for Role 2.");

      // Role 3 link
      const role3Link = result.signurl.find((item: { email: string }) => item.email === role3Email);
      if (role3Link) {
        setDocumentIdRole3('Document ready.');
        setRole3Status(
          <a className="text-blue-600 underline" href={role3Link.url} target="_blank" rel="noopener noreferrer">
            Click here to sign the document (Role 3)
          </a>
        );
      } else {
        setRole3Status("No signing URL found for Role 3.");
      }
    } catch (error) {
      console.error(error);
      setRole2Status('Error during Role 2 signing.');
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans bg-gray-50">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-800">Electronic Signature Workflow</h1>

      {/* Role 1 Section */}
      <section className="border-2 border-blue-200 rounded-lg p-6 mb-8 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-2xl font-semibold mb-4 text-blue-900 border-b pb-2">Role 1: Initiating Workflow</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="mb-4 block w-full border-2 border-blue-100 rounded-lg px-3 py-2 hover:border-blue-300 transition-colors duration-200"
        />
        {uploadedFilePath && (
          <div className="border-2 border-blue-100 mb-4 w-full h-[500px] rounded-lg overflow-hidden">
            <iframe
              title="PDF Preview"
              src={`http://localhost:3000/esign/preview/${uploadedFilePath}`}
              className="w-full h-full"
            />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={role1Name}
            onChange={(e) => setRole1Name(e.target.value)}
            placeholder="Your Name"
            className="border-2 border-blue-100 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
          />
          <input
            type="email"
            value={role1Email}
            onChange={(e) => setRole1Email(e.target.value)}
            placeholder="Your Email"
            className="border-2 border-blue-100 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
          />
        </div>
        <h3 className="font-semibold mb-3 text-blue-800">Phase 1: Add Sign Tags for Role 2 and Role 3</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={role2Name}
            onChange={(e) => setRole2Name(e.target.value)}
            placeholder="Role 2 Name"
            className="border-2 border-blue-100 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
          />
          <input
            type="email"
            value={role2Email}
            onChange={(e) => setRole2Email(e.target.value)}
            placeholder="Role 2 Email"
            className="border-2 border-blue-100 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={uploadFile}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2.5 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 font-semibold shadow-md"
          >
            Upload PDF
          </button>
          <button
            onClick={initiateWorkflow}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 font-semibold shadow-md"
          >
            Initiate Workflow
          </button>
        </div>
        {isLoading && <div className="loader mt-3" />}
        <p className="mt-3 text-blue-700">{initiateStatus}</p>
      </section>

      {/* Role 2 Section */}
      <section className="border-2 border-purple-200 rounded-lg p-6 mb-8 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-2xl font-semibold mb-4 text-purple-900 border-b pb-2">Phase 2: Role 2 Actions</h2>
        <input type="text" hidden value={templateId} readOnly />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={role3Name}
            onChange={(e) => setRole3Name(e.target.value)}
            placeholder="Role 3 Name"
            className="border-2 border-purple-100 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400"
          />
          <input
            type="email"
            value={role3Email}
            onChange={(e) => setRole3Email(e.target.value)}
            placeholder="Role 3 Email"
            className="border-2 border-purple-100 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400"
          />
          <input
            type="text"
            value={role3Phone}
            onChange={(e) => setRole3Phone(e.target.value)}
            placeholder="Role 3 Phone"
            className="border-2 border-purple-100 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400"
          />
        </div>
        <button
          onClick={role2Sign}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 font-semibold shadow-md"
        >
          Submit Role 3 and Sign
        </button>
        <div className="mt-3">{role2Status}</div>
      </section>

      {/* Role 3 Section */}
      <section className="border-2 border-indigo-200 rounded-lg p-6 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-900 border-b pb-2">Phase 3: Final Signing by Role 3</h2>
        <p className="mb-3 text-indigo-700">{documentIdRole3}</p>
        <div>{role3Status}</div>
      </section>
    </div>
  );
};

export default ESignWorkflow;
