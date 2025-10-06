import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { fetchColleges } from "../services/college-apis";
import SelectCollege from "../components/generate-certificates/SelectCollege";
import ParticipantsList from "../components/generate-certificates/ParticipantsList";
import { generateCertificates } from "../services/certificates-api";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { fetchParticipantsByCollegeId } from "../services/participants-api";

export default function GenerateCertificates() {
  const [colleges, setColleges] = useState([]);
  const [doneColleges, setDoneColleges] = useState(0);
  const [doneParticipants, setDoneParticipants] = useState(0);
  const [loading, setLoading] = useState(false);

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
      downloadLink.setAttribute("download", `${cred?.name}.pdf`); // Set the file name
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
    setLoading(true);
    setDoneParticipants(0);
    const zip = new JSZip(); // Create a new JSZip instance
    const mainFolder = zip.folder("all-certificates"); // Create the main folder within the ZIP
    if (!mainFolder) return;

    for (let i = 0, c = 0; i < categories.length; i++) {
      const category = categories[i];
      for (let j = 0; j < category.availableEvents.length; j++) {
        const availableEvent = category.availableEvents[j];
        const tmpEvent = events.find((e) => e.availableEventId == availableEvent.id);

        if (tmpEvent) {
          const tmpParticipants = participants?.filter((p) => p.eventIds.includes(tmpEvent.id));
          if (tmpParticipants.length == 0) {
            continue;
          }
          const eventFolder = mainFolder.folder(availableEvent.title); // Create a folder for the event

          for (let k = 0; k < tmpParticipants.length; k++) {
            c++;
            setDoneParticipants(c);
            try {
              const response = await generateCertificates({
                name: tmpParticipants[k]?.name,
                collegeName: selectedCollege?.name,
                eventName: availableEvent?.title,
              });

              // Create a Blob from the PDF data
              const pdfBlob = new Blob([response], { type: "application/pdf" });

              // Add the PDF Blob to the event folder
              const fileName = `_${k + 1}_${tmpParticipants[k]?.name}.pdf`;
              eventFolder.file(fileName, pdfBlob);
            } catch (error) {
              console.error(`Error generating certificate for ${tmpParticipants[k]?.name}:`, error);
            }
          }
        }
      }
    }

    // Generate the ZIP file and download it
    zip.generateAsync({ type: "blob" }).then((content) => {
      const zipFileName = `${selectedCollege.name}_certificates.zip`;

      // Create a temporary anchor element for download
      const downloadLink = document.createElement("a");
      const zipUrl = URL.createObjectURL(content);

      downloadLink.href = zipUrl;
      downloadLink.setAttribute("download", zipFileName); // Set the file name
      document.body.appendChild(downloadLink); // Append link to the document body

      // Trigger the download
      downloadLink.click();

      // Clean up
      document.body.removeChild(downloadLink);
    });
    setDoneParticipants(0);
    setLoading(false);
  };

  const handleAllCollegeDownload = async () => {
    setLoading(true);
    setDoneColleges(0);

    for (let i = 0; i < colleges.length; i++) {
      const college = colleges[i];
      const zip = new JSZip(); // Create a new ZIP instance for each college
      const collegeFolder = zip.folder(college.name); // Create a folder for the college

      // Fetch participants for the current college
      const participants = await fetchParticipantsByCollegeId(college.id);

      for (let j = 0; j < categories.length; j++) {
        const category = categories[j];
        for (let k = 0; k < category.availableEvents.length; k++) {
          const availableEvent = category.availableEvents[k];
          const tmpEvent = events.find((e) => e.availableEventId == availableEvent.id);

          if (tmpEvent) {
            const tmpParticipants = participants?.filter((p) => p.eventIds.includes(tmpEvent.id));
            if (tmpParticipants.length === 0) {
              continue;
            }

            const eventFolder = collegeFolder.folder(availableEvent.title); // Create a folder for the event

            for (let m = 0; m < tmpParticipants.length; m++) {
              try {
                const response = await generateCertificates({
                  name: tmpParticipants[m]?.name,
                  collegeName: college?.name,
                  eventName: availableEvent?.title,
                });

                // Create a Blob from the PDF data
                const pdfBlob = new Blob([response], { type: "application/pdf" });

                // Add the PDF Blob to the event folder
                const fileName = `_${m + 1}_${tmpParticipants[m]?.name}.pdf`;
                eventFolder.file(fileName, pdfBlob);
              } catch (error) {
                console.error(`Error generating certificate for ${tmpParticipants[m]?.name}:`, error);
              }
            }
          }
        }
      }

      // Generate the ZIP file for the current college and trigger download
      await zip.generateAsync({ type: "blob" }).then((content) => {
        const zipFileName = `${college.name}_certificates.zip`;

        // Create a temporary anchor element for download
        const downloadLink = document.createElement("a");
        const zipUrl = URL.createObjectURL(content);

        downloadLink.href = zipUrl;
        downloadLink.setAttribute("download", zipFileName); // Set the file name
        document.body.appendChild(downloadLink); // Append link to the document body

        // Trigger the download
        downloadLink.click();

        // Clean up
        document.body.removeChild(downloadLink);
      });

      setDoneColleges(i + 1); // Update the progress
    }

    setLoading(false);
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
          <Button variant="success" disabled={loading} onClick={handleDownloadParticipants}>
            Download List
          </Button>
          <Button variant="warning" disabled={loading} onClick={handleAllCollegeDownload}>
            {loading && doneColleges > 0 ? (doneColleges == colleges.length ? "Downloading..." : `Done: ${doneColleges}/${colleges.length}`) : "All Certificates"}
          </Button>
          <Button variant="info" disabled={loading} onClick={handleBulkDownload} style={{ width: "180.6px" }}>
            {loading && doneParticipants > 0 ? (doneParticipants == participants.length ? "Downloading..." : `Done: ${doneParticipants}/${participants.length}`) : "Generate Certificates"}
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
