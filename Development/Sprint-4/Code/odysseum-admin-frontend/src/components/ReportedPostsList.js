import React from "react";

const ReportedPostsList = ({ reports, onDeletePost }) => {
  console.log("ReportedPostsList received reports:", reports);

  return (
    <div>
      {reports && reports.length > 0 ? (
        reports.map((report) => {
          // Check if the report has the reportedPost field
          if (!report.reportedPost) {
            console.error("Report missing reportedPost field:", report);
            return (
              <div
                key={report._id}
                style={{ border: "1px solid red", padding: "10px", marginBottom: "10px" }}
              >
                <p>Error: Report {report._id} has no post details.</p>
              </div>
            );
          } else {
            return (
              <div
                key={report._id}
                style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}
              >
                <p>
                  <strong>Report ID:</strong> {report._id}
                </p>
                <p>
                  <strong>Post ID:</strong> {report.reportedPost._id}
                </p>
                <p>
                  <strong>Caption:</strong>{" "}
                  {report.reportedPost.caption ? report.reportedPost.caption : "No caption"}
                </p>
                <p>
                  <strong>Reason:</strong> {report.reason}
                </p>
                <button onClick={() => onDeletePost(report.reportedPost._id)}>
                  Delete Post
                </button>
              </div>
            );
          }
        })
      ) : (
        <p>No reported posts to display.</p>
      )}
    </div>
  );
};

export default ReportedPostsList;
