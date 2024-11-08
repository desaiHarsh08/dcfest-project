import { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import * as XLSX from "xlsx";
import { createCollege, fetchColleges } from "../services/college-apis";
import CollegeList from "../components/teams-participated/CollegeList";

const TeamsParticipatedPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchColleges()
      .then((data) => {
        setColleges(data);
      })
      .catch((err) => {
        console.log(err);
        setError(err);
      });
  }, [error]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const readExcel = () => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        resolve(jsonData);
      };

      reader.onerror = () => {
        console.error("Error reading file:", reader.error);
        reject(reader.error);
      };

      reader.readAsArrayBuffer(selectedFile);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return; // Stop execution if no file is selected
    }

    try {
      const collegeList = await readExcel();
      console.log(collegeList);

      for(let i=0; i<collegeList.length;i++){
        const collegeObj= {
            name: collegeList[i].college,
            icCode: collegeList[i].iccode,
            password: collegeList[i].password,
        }
        try {
            const response  = await createCollege(collegeObj)
            console.log(response)
        } catch (err) {
            console.log(err)
        }
      }

      fetchColleges()
        .then((data) => {
          setColleges(data);
        })
        .catch((err) => {
          console.log(err);
          setError(err);
        });

    } catch (error) {
      console.log(error);
      alert("Unable to read the excel sheet!");
    }
  };

  let content;

  if (error) {
    content = <p>Unable to fetch the participated colleges!</p>;
  } else {
    content = <CollegeList colleges={colleges} setColleges={setColleges} />;
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h1 className="text-center mb-4">Teams Participated Page</h1>
          <p className="text-center">
            This is where you can upload event participation files for the
            college.
          </p>
          <Form className="mt-4">
            <div className="d-flex justify-content-between align-items-center gap-3">
              <Form.Group controlId="formFile" className="mb-3 flex-grow-1">
                <Form.Control type="file" onChange={handleFileChange} />
              </Form.Group>
              <div className="mb-3">
                <Button variant="primary" onClick={handleUpload}>
                  Upload
                </Button>
              </div>
            </div>
          </Form>
        </Col>
      </Row>
      {content}
    </Container>
  );
};

export default TeamsParticipatedPage;
