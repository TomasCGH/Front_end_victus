import React, { useState, useEffect, useContext } from "react";
import "../cssComponents/AdminManagement.css"; // O usa Tailwind si prefieres
import Header from "./Header";
import { AdminContext } from "../contexts/Admin.context";
import { Link } from "react-router-dom";

function AdminManagement() {
  const {
    admins,
    getAdmin,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    findAdminsByName,
    error,
    loading,
  } = useContext(AdminContext);

  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    id: "",
    name: "",
    lastName: "",
    idType: "",
    idNumber: "",
    contactNumber: "",
    email: "",
    password: ""
  });
  const [isEditing, setIsEditing] = useState(false);

  // Cargar administradores al inicio
  useEffect(() => {
    getAdmin();
  }, []);

  // Actualizar lista filtrada cuando admins o el searchTerm cambien
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAdmins(admins);
    } else {
      findAdminsByName(searchTerm).then((results) => {
        setFilteredAdmins(results);
      });
    }
  }, [searchTerm, admins]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;

    const payload = {
      name: form.name,
      lastName: form.lastName,
      idType: form.idType,
      idNumber: form.idNumber,
      contactNumber: form.contactNumber,
      email: form.email,
      password: form.password,
    };

    if (isEditing && form.id) {
      await updateAdmin(form.id, payload);
    } else {
      await createAdmin(payload);
    }

    await getAdmin();
    setForm({ id: null, name: "", lastName: "", idType: "", idNumber: "", contactNumber: "", email: "", password: "" });
    setIsEditing(false);
  };

  const handleEdit = (admin) => {
    setForm({
      id: admin.id || "",
      name: admin.name || "",
      lastName: admin.lastName || "",
      idType: admin.idType || "",
      idNumber: admin.idNumber || "",
      contactNumber: admin.contactNumber || "",
      email: admin.email || "",
      password: admin.password || ""
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este administrador?")) {
      await deleteAdmin(id);
      await getAdmin();
    }
  };

  return (
    <>
      <Header />
      <div className="admin-management-container">
        <Link className="ButtonLogOut" to={"/"}>
          Cerrar Sesión
        </Link>
        <Link className="ButtonBack" to={"/ShowAdmins"}>
          Regresar
        </Link>
        <h2>Gestión de Administradores</h2>



        {/* 📝 Formulario */}
        <form className="admin-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            value={form.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="lastName"
            name="lastName"
            placeholder="Apellido"
            value={form.lastName}
            onChange={handleInputChange}
            required
          />
          <input
            type="idType"
            name="idType"
            placeholder="Tipo de ID"
            value={form.idType}
            onChange={handleInputChange}
            required
          />
          <input
            type="idNumber"
            name="idNumber"
            placeholder="Numero de ID"
            value={form.idNumber}
            onChange={handleInputChange}
            required
          />
          <input
            type="contactNumber"
            name="contactNumber"
            placeholder="Numero de contacto"
            value={form.contactNumber}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Correo"
            value={form.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleInputChange}
            required
          />
          <button type="submit">{isEditing ? "Actualizar" : "Crear"}</button>

          {/* 🔍 Buscador */}
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </form>
        {loading && <p>Cargando administradores...</p>}
        {error && <p style={{ color: "red" , margin: 10}}>{error}</p>}

        {/* 📋 Lista */}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.name}</td>
                <td>{admin.lastName}</td>
                <td>{admin.email}</td>
                <td>
                  <button onClick={() => handleEdit(admin)}>Editar</button>
                  <button onClick={() => handleDelete(admin.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AdminManagement;
