import React, { useState, useRef } from 'react';
import './Preview.css';
// import { PDFExport } from '@progress/kendo-react-pdf';
import '@progress/kendo-theme-material/dist/all.css';
import { Button } from '@progress/kendo-react-buttons';
import emailjs from 'emailjs-com';
import pdf2base64 from 'pdf-to-base64'
import QRCode from 'qrcode'
import { useHistory } from 'react-router';
import { drawDOM, exportPDF } from "@progress/kendo-drawing";

export default function Preview(props) {
  const pdfExportComponents = useRef(null);
  const { term, status } = props.invoicestatus;
  const [pdf, setPdf] = useState()
  const [base64, setBase64] = useState()
  const [qr, setQr] = useState()
  const {
    fullName,
    email,
    companyName,
    invoiceId,
    invoiceStart,
    invoiceEnd
  } = props.userInfo;

  const history = useHistory()

  const handlePdf = () => {
    if(invoiceId == "null" || email == "null" || fullName == "null" ){
      alert("Please fill required data!!!");
    } else {
      // setPdf(pdfExportComponents.current)
      // console.log(pdf)
      // pdf2base64(pdf)
      //   .then(
      //       (response) => {
      //           console.log(response); //cGF0aC90by9maWxlLmpwZw==
      //           setBase64(response)
      //       }
      //   )
      //   .catch(
      //       (error) => {
      //           console.log(error); //Exepection error....
      //       }
      //   )

      drawDOM(pdfExportComponents.current, {
        paperSize: "A4",
      })
        .then((group) => {
          return exportPDF(group);
        })
        .then((dataUri) => {
          console.log(dataUri.split(";base64,")[1])
          let temp = dataUri.split(";base64,")[1]
          setPdf(`data:application/pdf;base64,${temp}`)
          // setPdf(temp)
        });

      QRCode.toDataURL(invoiceId)
        .then(url => {
          console.log(url)
          setQr(url)
        })
        .catch(err => {
          console.error(err)
        })
      // pdfExportComponents.current.save();
    }
  }

  const sendToEmail = () => {
    console.log('sendEmail')
    // if(!pdf) return
    let templateParams = {
      toEmail: email,
      invoicePdf: pdf,
      QR: qr,
    }
    // invoicePdf: `<a href="data:application/pdf;base64,${pdf}" target="_blank">pdf is the</a>`,

    emailjs.send('service_lsvwxv9', 'template_97xok2b', templateParams, 'user_DjLVtsgqwmWG7WeLqg1iF')
    .then(function(response) {
       console.log('SUCCESS!', response.status, response.text);
    }, function(error) {
       console.log('FAILED...', error);
    });
    
    // history.push("/")
  }

  return (
    <>
      {/* <PDFExport ref={pdfExportComponents} paperSize="auto"> */}
        <div className="Preview_page" ref={pdfExportComponents}>
          <div className="Preview_content">
            <h1>Invoice</h1>
            <div className="left_right_div">
              <div className="Preview_left">
                <h3 className="tag">Bill To </h3>
                <text>FullName: {fullName}</text>
                <text>companyName: {companyName} </text>
                <text>Email: {email} </text>
              </div>
              <div className="Preview_right">
                <h3>Invoice Details</h3>
                <text>Invoice Id : {invoiceId} </text>
                <text>Invoice Start: {invoiceStart}</text>
                <text>Invoice End: {invoiceEnd}</text>
              </div>
            </div>
            <div className="data Preview_items">
              <span>Item</span>
              <span>Qty</span>
              <span>Rate</span>
              <span>Amount</span>
            </div>

            {props.data &&
              props.data.map(product => {
                return (
                  <>
                    <div className="Preview_items_details">
                      <p>{product.item}</p>
                      <p>{product.qty}</p>
                      <p>{product.rate}</p>
                      <p>{product.qty * product.rate} </p>
                    </div>
                  </>
                );
              })}
            <div className="invoice_status">
              <h4>
                Terms: <span className="summary_text"> {term} </span>
              </h4>
            </div>
            <div className="summary_section">
              <h3 className="summary_title">Invoice Summary</h3>
              <h4>
                Status:
                {status == 'Paid' && (
                  <span className="status_text" style={{ color: 'green' }}>
                    {status}
                  </span>
                )}
                {status == 'OutStanding' && (
                  <span className="status_text" style={{ color: '#e8b202' }}>
                    {status}
                  </span>
                )}
                {status == 'Late' && (
                  <span className="status_text" style={{ color: 'red' }}>
                    {status}
                  </span>
                )}
              </h4>
              
              <h4 className="total_amount">
                Total Amount: <span className="summary_text"> INR {props.totalAmount}</span>
              </h4>
            </div>
          </div>
        </div>
      {/* </PDFExport> */}

      <div className="Preview_download_btn">
        <Button primary={true} onClick={handlePdf}>
          Convert To Pdf
        </Button>
        <Button secondary={true} onClick={sendToEmail}>
          Send To Email
        </Button>
      </div>
    </>
  );
}
