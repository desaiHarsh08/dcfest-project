import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { fetchColleges } from "../services/college-apis";
import SelectCollege from "../components/generate-certificates/SelectCollege";
import ParticipantsList from "../components/generate-certificates/ParticipantsList";
import { generateCertificates } from "../services/certificates-api";
import * as XLSX from "xlsx";

export default function GenerateCertificates() {
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState();
  const setActualParticipatedColleges = useState([])[1];
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (!selectedCollege) {
      fetchColleges()
        .then((data) => {
          const participatedColleges = data.filter((c) => c.detailsUploaded);
          setColleges(participatedColleges);
          setActualParticipatedColleges(participatedColleges);
          setSelectedCollege(participatedColleges[0]);
        })
        .catch((err) => console.error("Error fetching colleges:", err));
    }
  }, [selectedCollege]);

  const handleGenerateCertificate = async (cred) => {
    try {
      const response = await generateCertificates(cred);

      // Create a Blob from the PDF data
      const pdfBlob = new Blob([response], { type: "application/pdf" });

      // Create a URL for the Blob
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Create a temporary anchor element for download
      const downloadLink = document.createElement("a");
      downloadLink.href = pdfUrl;
      downloadLink.setAttribute("download", "certificate.pdf"); // Set the file name
      document.body.appendChild(downloadLink); // Append link to the document body

      // Trigger the download
      downloadLink.click();

      // Clean up
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.log(error);
    }
  };

  const handleBulkDownload = async () => {
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      for (let j = 0; j < category.availableEvents.length; j++) {
        const availableEvent = category.availableEvents[j];
        const tmpEvent = events.find((e) => e.availableEventId == availableEvent.id);
        if (tmpEvent) {
          const tmpParticipants = participants?.filter((p) => p.eventIds.includes(tmpEvent.id));
          for (let k = 0; k < tmpParticipants.length; k++) {
            await handleGenerateCertificate({
              name: tmpParticipants[k]?.name,
              collegeName: selectedCollege?.name,
              eventName: availableEvent?.title,
            });
          }
        }
      }
    }
  };

  const handleDownloadParticipants = async () => {
    // Assuming participants are stored in an array in the `participants` state
    const participantsData = [];
    let count = 0;
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      for (let j = 0; j < category.availableEvents.length; j++) {
        const availableEvent = category.availableEvents[j];
        const tmpEvent = events.find((e) => e.availableEventId == availableEvent.id);
        if (tmpEvent) {
          const tmpParticipants = participants?.filter((p) => p.eventIds.includes(tmpEvent.id));
          for (let k = 0; k < tmpParticipants.length; k++) {
            let participant = tmpParticipants[k];
            participantsData.push({
              "Sr. No.": ++count,
              ICCODE: selectedCollege.icCode,
              College: selectedCollege.name,
              Group: participant.group,
              Name: participant.name,
              Event: availableEvent.title,
            });
          }
        }
      }
    }

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    // Create a worksheet from the participants data
    const ws = XLSX.utils.json_to_sheet(participantsData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Participants");

    // Generate a download link for the file
    const fileName = "participants.xlsx";
    XLSX.writeFile(wb, fileName); // This will automatically trigger the download of the Excel file
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between mb-5">
        <SelectCollege colleges={colleges} selectedCollege={selectedCollege} setSelectedCollege={setSelectedCollege} />
        <div>
          <Button variant="success" onClick={handleDownloadParticipants}>
            Download List
          </Button>
          <Button variant="info" onClick={handleBulkDownload}>
            Generate Certificates
          </Button>
        </div>
      </div>
      <ParticipantsList
        selectedCollege={selectedCollege}
        categories={categories}
        setCategories={setCategories}
        events={events}
        setEvents={setEvents}
        participants={participants}
        setParticipants={setParticipants}
        onGenerateCertificate={handleGenerateCertificate}
      />
    </div>
  );
}
