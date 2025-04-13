import React from "react";

const ReportedPostsList = ({ reports, onDeletePost, onIgnoreReport }) => {
  console.log("ReportedPostsList received reports:", reports);

  return (
    <div>
      {reports && reports.length > 0 ? (
        reports.map((report) => {
          const post = report.reportedPost;
          return (
            <div
              key={report._id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "4px"
              }}
            >
              <p>
                <strong>Report ID:</strong> {report._id}
              </p>
              {post ? (
                <>
                  <p>
                    <strong>Post ID:</strong> {post._id}
                  </p>
                  <p>
                    <strong>Caption/Content:</strong>{" "}
                    {post.caption ? post.caption : "No caption provided."}
                  </p>
                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div>
                      <strong>Media:</strong>
                      <br />
                      <img
                        src={post.mediaUrls[0]}
                        alt="Post Media"
                        style={{ maxWidth: "200px" }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: "red" }}>
                  No post details available in this report.
                </p>
              )}
              <p>
                <strong>Reason:</strong> {report.reason}
              </p>
              <div>
                <button onClick={() => onDeletePost(post ? post._id : null)}>
                  Delete Post
                </button>
                <button
                  onClick={() => onIgnoreReport(report._id)}
                  style={{ marginLeft: "10px" }}
                >
                  Ignore Report
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <p>No reported posts to display.</p>
      )}
    </div>
  );
};

export default ReportedPostsList;
