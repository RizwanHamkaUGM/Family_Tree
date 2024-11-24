import React, { useState, useEffect } from "react";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAZlF4rgNOUtRY0r4oyN50CcinFj4tMFP0",
  authDomain: "silsilah-keluarga-10d90.firebaseapp.com",
  databaseURL: "https://silsilah-keluarga-10d90-default-rtdb.firebaseio.com",
  projectId: "silsilah-keluarga-10d90",
  storageBucket: "silsilah-keluarga-10d90.firebasestorage.app",
  messagingSenderId: "852351887250",
  appId: "1:852351887250:web:cd349b0f66075f15f8434b",
  measurementId: "G-9Y1PV2YS68"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const App = () => {
  const [familyData, setFamilyData] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [treeUrl, setTreeUrl] = useState(null);
  const [newMember, setNewMember] = useState({
    id: "",
    name: "",
    anggota: "",
    parent1_id: null,
    parent2_id: null,
  });

  const [editingMember, setEditingMember] = useState(null); // For editing

  useEffect(() => {
    fetchFamilyData();
    fetchFamilyTree();
  }, []);

  const fetchFamilyData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/family");
      setFamilyData(response.data.family);
    } catch (error) {
      console.error("Error fetching family data:", error);
    }
  };

  const fetchFamilyTree = async () => {
    try {
      const response = await axios.get("http://localhost:5000/family/tree", {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      setTreeUrl(url);
    } catch (error) {
      console.error("Error fetching family tree:", error);
    }
  };

  const addFamilyMember = async () => {
    const existingIds = familyData.map(member => member.id);
    if (existingIds.includes(newMember.id)) {
      alert("Error: ID already exists. Please choose a different ID.");
      return;
    }
  
    try {
      await axios.post("http://localhost:5000/family", newMember);
      alert("Family member added successfully!");
      setNewMember({ id: "", name: "", anggota: "", parent1_id: null, parent2_id: null });
      fetchFamilyData();
      fetchFamilyTree();
    } catch (error) {
      console.error("Error adding family member:", error);
    }
  };

  const fetchRelationships = async (memberId) => {
    try {
      const response = await axios.get(`http://localhost:5000/family/relationship/${memberId}`);
      const data = response.data;
      if (data.length === 0) {
        alert("No relationships found.");
      }
      setRelationships(data);
      setSelectedMember(memberId);
    } catch (error) {
      console.error("Error fetching relationships:", error);
    }
  };

  const updateMember = async () => {
    if (!editingMember.name || !editingMember.anggota) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/family/${editingMember.id}`,
        {
          name: editingMember.name,
          anggota: editingMember.anggota,
          parent1_id: editingMember.parent1_id || null,
          parent2_id: editingMember.parent2_id || null,
        }
      );
      alert("Family member updated successfully!");
      setEditingMember(null);
      fetchFamilyData();
      fetchFamilyTree();
    } catch (error) {
      console.error("Error updating family member:", error);
      alert("Failed to update member.");
    }
  };

  const deleteMember = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) {
      return;
    }
    try {
      const response = await axios.delete(`http://localhost:5000/family/${id}`);
      alert("Family member deleted successfully!");
      fetchFamilyData();
      fetchFamilyTree();
    } catch (error) {
      console.error("Error deleting family member:", error);
      alert("Failed to delete member.");
      console.log("Detailed error: ", error);  // Debugging
    }
  };
  

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        backgroundColor: "#F9FAFC",
        color: "#333",
        minHeight: "100vh",
      }}
    >
      <header style={{ marginBottom: "20px", textAlign: "center" }}>
        <h1 style={{ color: "#007AFF" }}>Family Tree</h1>
        <p style={{ fontSize: "14px", color: "#6B7280" }}>Manage and visualize your family relationships</p>
      </header>

      {/* Add Member Form */}
      <section
        style={{
          marginBottom: "20px",
          backgroundColor: "white",
          borderRadius: "15px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          padding: "20px",
        }}
      >
        <h2 style={{ color: "#007AFF", marginBottom: "10px" }}>Add New Family Member</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addFamilyMember();
          }}
          style={{ display: "grid", gap: "10px" }}
        >
          <input
            type="text"
            placeholder="ID"
            value={newMember.id}
            onChange={(e) => setNewMember({ ...newMember, id: parseInt(e.target.value) })}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Name"
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Anggota (e.g., AYAH, IBU)"
            value={newMember.anggota}
            onChange={(e) => setNewMember({ ...newMember, anggota: e.target.value })}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Parent 1 ID (optional)"
            value={newMember.parent1_id || ""}
            onChange={(e) => setNewMember({ ...newMember, parent1_id: e.target.value ? parseInt(e.target.value) : null })}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Parent 2 ID (optional)"
            value={newMember.parent2_id || ""}
            onChange={(e) => setNewMember({ ...newMember, parent2_id: e.target.value ? parseInt(e.target.value) : null })}
            style={inputStyle}
          />
          <button
            type="submit"
            style={{
              padding: "10px",
              backgroundColor: "#007AFF",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Add Member
          </button>
        </form>
      </section>

      {/* Family Members Table */}
      <section>
        <h2 style={{ color: "#007AFF" }}>Family Members</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Anggota</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {familyData.map((member) => (
              <tr key={member.id}>
                <td>{member.id}</td>
                <td>{member.name}</td>
                <td>{member.anggota}</td>
                <td>
                  <button
                    style={actionButtonStyle}
                    onClick={() => fetchRelationships(member.id)}
                  >
                    View Relationships
                  </button>
                  <button
                    style={actionButtonStyle}
                    onClick={() => setEditingMember(member)}
                  >
                    Edit
                  </button>
                  <button
                    style={actionButtonStyle}
                    onClick={() => deleteMember(member.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selectedMember && (
        <section>
            <h2 style={{ color: "#007AFF", marginTop: "20px" }}>Relationships</h2>
            <ul>
                {relationships.map((relation) => (
                    <li key={relation.id}>{relation.name}: {relation.relationship}</li>
                ))}
            </ul>
        </section>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <section>
          <h2 style={{ color: "#007AFF", marginTop: "20px" }}>Edit Member</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMember();
            }}
            style={{ display: "grid", gap: "10px" }}
          >
            <input
              type="text"
              value={editingMember.name}
              onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
              style={inputStyle}
            />
            <input
              type="text"
              value={editingMember.anggota}
              onChange={(e) => setEditingMember({ ...editingMember, anggota: e.target.value })}
              style={inputStyle}
            />
            <input
              type="text"
              value={editingMember.parent1_id || ""}
              onChange={(e) => setEditingMember({ ...editingMember, parent1_id: e.target.value ? parseInt(e.target.value) : null })}
              style={inputStyle}
            />
            <input
              type="text"
              value={editingMember.parent2_id || ""}
              onChange={(e) => setEditingMember({ ...editingMember, parent2_id: e.target.value ? parseInt(e.target.value) : null })}
              style={inputStyle}
            />
            <button
              type="submit"
              style={{
                padding: "10px",
                backgroundColor: "#007AFF",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              Update Member
            </button>
          </form>
        </section>
      )}

      {/* Family Tree Visualization */}
      <section style={{ marginTop: "20px" }}>
        <h2 style={{ color: "#007AFF" }}>Family Tree Visualization</h2>
        {treeUrl ? (
          <img
            src={treeUrl}
            alt="Family Tree"
            style={{
              width: "100%",
              borderRadius: "15px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          />
        ) : (
          <p>Loading family tree...</p>
        )}
      </section>
    </div>
  );
};

const inputStyle = {
  padding: "10px",
  border: "1px solid #E5E7EB",
  borderRadius: "10px",
  fontSize: "16px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  margin: "20px 0",
  textAlign: "left",
};

const actionButtonStyle = {
  padding: "5px 10px",
  backgroundColor: "#007AFF",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default App;
