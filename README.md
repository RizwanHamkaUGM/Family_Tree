# Family Tree Management System

A web-based family tree management system built with Flask backend and React frontend. This application allows users to create, visualize, and manage family relationships through an interactive interface.

## 🌟 Features

- Create and manage family members
- Visualize family relationships in a tree diagram
- Calculate and display relationships between family members
- Real-time tree diagram updates
- CRUD operations for family members

## 🛠 Technology Stack

- **Backend**: Python Flask
- **Frontend**: React
- **Database**: Firebase Realtime Database
- **Graph Generation**: QuickChart API
- **Deployment**: Vercel

## 🚀 Live Demo

Backend API: https://flask-test-silsilah.vercel.app

## 💻 Core Functionalities

### Backend (Flask)

```python
# Key endpoints
@app.route("/family", methods=["GET"])     # Get all family members
@app.route("/family", methods=["POST"])    # Add new family member
@app.route("/family/tree")                 # Generate family tree visualization
@app.route("/family/relationship/<id>")    # Calculate relationships
```

The backend handles:
- Data management with Firebase
- Family relationship calculations
- Tree diagram generation using QuickChart
- RESTful API endpoints

### Frontend (React)

```javascript
// Key components
const App = () => {
  // Core functionalities
  const fetchFamilyData = async () => { ... }    // Get family data
  const addFamilyMember = async () => { ... }    // Add new member
  const fetchRelationships = async () => { ... } // Get relationships
  const updateMember = async () => { ... }       // Update member
}
```

The frontend provides:
- User-friendly interface for data management
- Real-time visualization of family tree
- Forms for adding/editing family members
- Relationship viewing functionality

## 🔄 Data Structure

Family members are stored with the following structure:
```json
{
  "id": "number",
  "name": "string",
  "anggota": "string",
  "parent1_id": "number|null",
  "parent2_id": "number|null"
}
```

## 📝 Usage

1. Add family members using the form
2. View relationships by clicking "View Relationships"
3. Edit or delete members as needed
4. View the automatically generated family tree

