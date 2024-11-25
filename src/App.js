import React, { useState, useEffect } from "react";
import axios from "axios";

// Konfigurasi axios untuk menangani CORS
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Base URL untuk API
const API_BASE_URL = "https://flask-test-silsilah.vercel.app";

const App = () => {
  const [familyData, setFamilyData] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [treeUrl, setTreeUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newMember, setNewMember] = useState({
    id: "",
    name: "",
    anggota: "",
    parent1_id: null,
    parent2_id: null,
  });
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    fetchFamilyData();
    fetchFamilyTree();
  }, []);

  const handleApiError = (error, action) => {
    console.error(`Error ${action}:`, error);
    const errorMessage = error.response?.data?.message || error.message || `Failed to ${action}`;
    setError(errorMessage);
    alert(errorMessage);
  };

  const fetchFamilyData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/family`);
      setFamilyData(response.data.family);
      setError(null);
    } catch (error) {
      handleApiError(error, 'fetching family data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyTree = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/family/tree`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      setTreeUrl(url);
      setError(null);
    } catch (error) {
      handleApiError(error, 'fetching family tree');
    }
  };

  const addFamilyMember = async () => {
  // Validasi: Pastikan semua field yang wajib diisi sudah terisi
  if (!newMember.id) {
    alert("Please fill in the required field: ID");
    return;
  }

  if (!newMember.name || !newMember.anggota) {
    alert("Please fill in the required fields: Name and Anggota");
    return;
  }

  // Validasi: Periksa apakah ID sudah digunakan
  const existingIds = familyData.map(member => member.id);
  if (existingIds.includes(newMember.id)) {
    alert("Error: ID already exists. Please choose a different ID.");
    return;
  }

  setLoading(true);
  try {
    const response = await axios.post(`${API_BASE_URL}/family`, newMember, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Add member response:', response);
    alert("Family member added successfully!");
    setNewMember({ id: "", name: "", anggota: "", parent1_id: null, parent2_id: null });
    await fetchFamilyData();
    await fetchFamilyTree();
    setError(null);
  } catch (error) {
    handleApiError(error, 'adding family member');
  } finally {
    setLoading(false);
  }
};

  const updateMember = async () => {
    if (!editingMember.name || !editingMember.anggota) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      console.log('Sending update request for ID:', editingMember.id);
      const response = await axios.put(
        `${API_BASE_URL}/family/${editingMember.id}`,
        {
          name: editingMember.name,
          anggota: editingMember.anggota,
          parent1_id: editingMember.parent1_id || null,
          parent2_id: editingMember.parent2_id || null,
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Update response:', response);
      alert("Family member updated successfully!");
      setEditingMember(null);
      await fetchFamilyData();
      await fetchFamilyTree();
      setError(null);
    } catch (error) {
      handleApiError(error, 'updating family member');
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) {
      return;
    }

    setLoading(true);
    try {
      console.log('Sending delete request for ID:', id);
      const response = await axios.delete(`${API_BASE_URL}/family/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Delete response:', response);
      alert("Family member deleted successfully!");
      await fetchFamilyData();
      await fetchFamilyTree();
      setError(null);
    } catch (error) {
      handleApiError(error, 'deleting family member');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelationships = async (memberId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/family/relationship/${memberId}`);
      const data = response.data;
      if (data.length === 0) {
        alert("No relationships found.");
      }
      setRelationships(data);
      setSelectedMember(memberId);
      setError(null);
    } catch (error) {
      handleApiError(error, 'fetching relationships');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: "#F9FAFC" 
      }}>
        <p>Loading...</p>
      </div>
    );
  }
  const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    width: '90%',
    maxWidth: '500px',
    zIndex: 1000,
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", backgroundColor: "#e6f9ff", color: "#333", minHeight: "100vh" }}>

      <header style={{ marginBottom: "20px", textAlign: "center" }}>
        <h1 style={{ color: "#007AFF", fontSize: "2.5em" }}>SILSILAH KELUARGA!</h1>
        <p style={{ fontSize: "1.2em", color: "#555" }}>Manage and visualize your family relationships</p>
      </header>

      {/* Error Handling */}
      {error && <div style={{ ...alertStyle, backgroundColor: "#FEE2E2", color: "#B91C1C" }}>{error}</div>}

      {/* Add Member Form */}
      <section style={sectionStyle}>
        <h2 style={sectionHeaderStyle}>Tambah Data Keluarga</h2>
        <form onSubmit={(e) => { e.preventDefault(); addFamilyMember(); }} style={{ display: "grid", gap: "10px" }}>
          <input
            type="text"
            placeholder="ID (wajib diisi)"
            value={newMember.id}
            onChange={(e) => setNewMember({ ...newMember, id: parseInt(e.target.value) })}
            style={inputStyle}
            required
          />
          <input
            type="text"
            placeholder="Name"
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            style={inputStyle}
            required
          />
          <input
            type="text"
            placeholder="Anggota (e.g., AYAH, IBU)"
            value={newMember.anggota}
            onChange={(e) => setNewMember({ ...newMember, anggota: e.target.value })}
            style={inputStyle}
            required
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
          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </form>
      </section>

      {/* Family Members Table */}
      <section>
        <h2 style={sectionHeaderStyle}>Anggota Keluarga</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>ID</th>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Anggota</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {familyData.map((member) => (
                <tr key={member.id}>
                  <td style={tableCellStyle}>{member.id}</td>
                  <td style={tableCellStyle}>{member.name}</td>
                  <td style={tableCellStyle}>{member.anggota}</td>
                  <td style={tableCellStyle}>
                    <button style={actionButtonStyle} onClick={() => fetchRelationships(member.id)} disabled={loading}>
                      View Relationships
                    </button>
                    <button style={actionButtonStyle} onClick={() => setEditingMember(member)} disabled={loading}>
                      Edit
                    </button>
                    <button style={{ ...actionButtonStyle, backgroundColor: '#DC2626' }} onClick={() => deleteMember(member.id)} disabled={loading}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Relationships */}
      {selectedMember && (
        <section style={sectionStyle}>
          <h2 style={sectionHeaderStyle}>Relationships</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {relationships.map((relation) => (
              <li key={relation.id} style={{ padding: "10px", borderBottom: "1px solid #E5E7EB", fontSize: "14px" }}>
                {relation.name}: {relation.relationship}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <section style={modalStyle}>
          <h2 style={sectionHeaderStyle}>Edit Member</h2>
          <form onSubmit={(e) => { e.preventDefault(); updateMember(); }} style={{ display: "grid", gap: "10px" }}>
            <input type="text" placeholder="Name" value={editingMember.name} onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })} style={inputStyle} required />
            <input type="text" placeholder="Anggota" value={editingMember.anggota} onChange={(e) => setEditingMember({ ...editingMember, anggota: e.target.value })} style={inputStyle} required />
            <input type="text" placeholder="Parent 1 ID" value={editingMember.parent1_id || ""} onChange={(e) => setEditingMember({ ...editingMember, parent1_id: e.target.value ? parseInt(e.target.value) : null })} style={inputStyle} />
            <input type="text" placeholder="Parent 2 ID" value={editingMember.parent2_id || ""} onChange={(e) => setEditingMember({ ...editingMember, parent2_id: e.target.value ? parseInt(e.target.value) : null })} style={inputStyle} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={buttonStyle} disabled={loading}>
                {loading ? 'Updating...' : 'Update Member'}
              </button>
              <button type="button" style={{ ...buttonStyle, backgroundColor: '#6B7280' }} onClick={() => setEditingMember(null)}>Cancel</button>
            </div>
          </form>
        </section>
      )}

      {/* Family Tree Visualization */}
      {treeUrl && (
        <section style={{ marginTop: "20px", textAlign: "center" }}>
          <h2 style={sectionHeaderStyle}>Visualisasi Silsilah</h2>
          <img src={treeUrl} alt="Family Tree" style={{ maxWidth: "100%", height: "auto", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }} />
        </section>
      )}

    </div>
  );
};

// Update styles to improve the overall UI
const sectionStyle = {
  marginBottom: "20px",
  backgroundColor: "white",
  borderRadius: "15px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  padding: "20px",
};

const sectionHeaderStyle = {
  color: "#007AFF",
  marginBottom: "10px",
};

// Other styles remain the same
const inputStyle = {
  padding: "10px 15px",
  borderRadius: "6px",
  border: "1px solid #D1D5DB",
  fontSize: "14px",
  width: "100%",
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "10px 15px",
  backgroundColor: "#007AFF",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500",
  transition: "background-color 0.2s",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "white",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  marginTop: "10px",
};

const tableHeaderStyle = {
  backgroundColor: "#F3F4F6",
  padding: "12px",
  textAlign: "left",
  fontSize: "14px",
  fontWeight: "600",
  color: "#374151",
  borderBottom: "1px solid #E5E7EB",
};

const tableCellStyle = {
  padding: "12px",
  borderBottom: "1px solid #E5E7EB",
  fontSize: "14px",
};

const actionButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "#007AFF",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "12px",
  marginRight: "4px",
  transition: "background-color 0.2s",
};

// Error alert style
const alertStyle = {
  padding: "10px",
  borderRadius: "8px",
  marginBottom: "20px",
};

export default App;