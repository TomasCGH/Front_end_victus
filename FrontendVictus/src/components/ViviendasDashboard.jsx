import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../cssComponents/AdminManagement.css";
import Header from "./Header";
import { ViviendaContext } from "../contexts/Vivienda.context.jsx";

const FORM_INITIAL_STATE = {
  id: "",
  numero: "",
  tipo: "Apartamento",
  estado: "Disponible",
  conjuntoId: "",
};

const TIPO_OPTIONS = ["Apartamento", "Casa", "Dúplex"];
const ESTADO_OPTIONS = ["Disponible", "Ocupada", "Mantenimiento"];

function ViviendasDashboard() {
  const {
    viviendas,
    loading,
    error,
    getViviendas,
    createVivienda,
    updateVivienda,
    deleteVivienda,
  } = useContext(ViviendaContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(FORM_INITIAL_STATE);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    getViviendas();
  }, [getViviendas]);

  const filteredViviendas = useMemo(() => {
    if (!searchTerm) {
      return viviendas;
    }

    const normalisedTerm = searchTerm.toLowerCase();
    return viviendas.filter((item) => {
      const numero = String(item?.numero ?? item?.propertyNumber ?? "").toLowerCase();
      const tipo = String(item?.tipo ?? item?.propertyType ?? "").toLowerCase();
      const estado = String(item?.estado ?? "").toLowerCase();
      return (
        numero.includes(normalisedTerm) ||
        tipo.includes(normalisedTerm) ||
        estado.includes(normalisedTerm)
      );
    });
  }, [searchTerm, viviendas]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(FORM_INITIAL_STATE);
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.numero || !form.tipo || !form.estado) {
      return;
    }

    const payload = {
      numero: form.numero.trim(),
      tipo: form.tipo,
      estado: form.estado,
      conjuntoId: form.conjuntoId || undefined,
    };

    if (isEditing && form.id) {
      await updateVivienda(form.id, payload);
    } else {
      await createVivienda(payload);
    }

    await getViviendas();
    resetForm();
  };

  const handleEdit = (item) => {
    setForm({
      id: item?.id ?? "",
      numero: item?.numero ?? item?.propertyNumber ?? "",
      tipo: item?.tipo ?? item?.propertyType ?? "Apartamento",
      estado: item?.estado ?? "Disponible",
      conjuntoId:
        item?.conjuntoId ?? item?.conjunto?.id ?? item?.conjuntoResidencialId ?? "",
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    const confirmation = window.confirm("¿Deseas eliminar esta vivienda?");
    if (!confirmation) {
      return;
    }
    await deleteVivienda(id);
    await getViviendas();
  };

  const conjuntoLabel = (item) => {
    return (
      item?.conjunto?.nombre ??
      item?.conjuntoNombre ??
      item?.conjuntoResidencialNombre ??
      item?.conjuntoId ??
      item?.conjuntoResidencialId ??
      "Sin asignar"
    );
  };

  return (
    <>
      <Header />
      <div className="admin-management-container">
        <Link className="ButtonLogOut" to={"/dashboard"}>
          Panel
        </Link>
        <Link className="ButtonBack" to={"/dashboard"}>
          Regresar
        </Link>
        <h2>Gestión de Viviendas</h2>

        <form className="admin-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="numero"
            placeholder="Número de vivienda"
            value={form.numero}
            onChange={handleChange}
            required
          />

          <select name="tipo" value={form.tipo} onChange={handleChange} required>
            {TIPO_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select name="estado" value={form.estado} onChange={handleChange} required>
            {ESTADO_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="conjuntoId"
            placeholder="ID del conjunto residencial"
            value={form.conjuntoId}
            onChange={handleChange}
          />

          <button type="submit">{isEditing ? "Actualizar" : "Crear"}</button>
          {isEditing && (
            <button type="button" onClick={resetForm}>
              Cancelar
            </button>
          )}

          <input
            type="text"
            placeholder="Buscar por número, tipo o estado"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="search-input"
          />
        </form>

        {loading && <p>Cargando viviendas...</p>}
        {error && (
          <p style={{ color: "red", margin: 10 }}>
            {error}
          </p>
        )}

        <table className="admin-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Conjunto residencial</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredViviendas?.map((item) => (
              <tr key={item?.id ?? item?.numero}>
                <td>{item?.numero ?? item?.propertyNumber ?? "N/D"}</td>
                <td>{item?.tipo ?? item?.propertyType ?? "N/D"}</td>
                <td>{item?.estado ?? "N/D"}</td>
                <td>{conjuntoLabel(item)}</td>
                <td>
                  <button type="button" onClick={() => handleEdit(item)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item?.id)}
                    disabled={!item?.id}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ViviendasDashboard;
