// /* eslint-disable react/prop-types */
// import JoditEditor from "jodit-react";
// import { useRef, useState } from "react";

// export default function RTE({ name = "", label = "", defaultValue = "", onChange }) {
//   const editor = useRef(null);
//   const [content, setContent] = useState(defaultValue); // Initialize with defaultValue

//   const handleEditorChange = (newContent) => {
//     setContent(newContent);
//     onChange(newContent); // Pass the content directly to onChange
//   };

//   return (
//     <div className="w-full">
//       <label htmlFor={name}>{label}</label>
//       <JoditEditor
//         ref={editor}
//         config={{

    
//           height: 500,
//         }}
//         value={content} // Bind the content state
//         onBlur={(newContent) => handleEditorChange(newContent)} // Use the handler function
//         // onChange={(c) => onChange(c)}
//       />
//     </div>
//   );
// }



/* eslint-disable react/prop-types */
import JoditEditor from "jodit-react";
import { useRef, useState } from "react";

export default function RTE({ name = "", label = "", defaultValue = "", onChange }) {
  const editor = useRef(null);
  const [content, setContent] = useState(defaultValue); // Initialize with defaultValue

  const handleEditorChange = (newContent) => {
    setContent(newContent);
    onChange(newContent); // Pass the content directly to onChange
  };

  return (
    <div className="w-full">
      <label htmlFor={name}>{label}</label>
      <JoditEditor
        ref={editor}
        config={{
          height: 500,
          toolbarSticky: false,
          toolbarAdaptive: true,
          cleanHTML: false, // Disable aggressive cleaning
          paste: {
            // allowTags: ["p", "br", "strong", "em", "u", "ul", "ol", "li", "span", "a", "img"], // Allowed tags
            processPasteHTML: true, // Process HTML pasted content
            defaultAction: "insert_as_html", // Keep formatting
          },
          iframe: false,
          removeButtons: ["image", "video"], // Remove unwanted buttons
        }}
        value={content} // Bind the content state
        onBlur={(newContent) => handleEditorChange(newContent)} // Use the handler function
      />
    </div>
  );
}
