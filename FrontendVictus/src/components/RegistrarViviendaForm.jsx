import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ViviendaContext } from "../contexts/Vivienda.context.jsx";

const API_BASE_URL = "https://victus-api-9g73.onrender.com/victusresidenciasEasy/api/v1";
const TIPO_OPCIONES = ["Apartamento", "Casa", "Dúplex"];
const ESTADO_OPCIONES = ["Disponible", "Ocupada", "Mantenimiento"];

const endpointsConjuntos = [
  `${API_BASE_URL}/conjuntos-residenciales/todos`,
  `${API_BASE_URL}/conjuntosResidenciales/todos`,
  `${API_BASE_URL}/conjuntos/todos`,
];

const initialFormValues = {
  numero: "",
  tipo: "Apartamento",
  estado: "Disponible",
  conjuntoId: "",
};

function RegistrarViviendaForm({ onSuccess, onCancel }) {
  const { createVivienda, getViviendas } = useContext(ViviendaContext);

  const [formValues, setFormValues] = useState(initialFormValues);
  const [conjuntos, setConjuntos] = useState([]);
  const [loadingConjuntos, setLoadingConjuntos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const fetchConjuntos = useCallback(async () => {
    setLoadingConjuntos(true);
    setFeedback({ type: "", message: "" });

    for (const url of endpointsConjuntos) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Respuesta no válida del endpoint ${url}`);
        }
        const data = await response.json();
        const lista = Array.isArray(data?.data) ? data.data : [];
        setConjuntos(lista);
        return;
      } catch (error) {
        console.warn("No se pudo obtener conjuntos residenciales desde", url, error);
      }
    }

    setFeedback({
      type: "error",
      message: "No fue posible cargar los conjuntos residenciales. Intenta nuevamente más tarde.",
    });
  }, []);

  useEffect(() => {
    fetchConjuntos();
  }, [fetchConjuntos]);

  const conjuntoOptions = useMemo(() => {
    if (!conjuntos.length) {
      return [];
    }

    return conjuntos.map((item) => ({
      id: item?.id ?? item?.conjuntoId ?? item?.uuid ?? "",
      nombre:
        item?.nombre ??
        item?.name ??
        item?.conjuntoNombre ??
        item?.titulo ??
        item?.codigo ??
        "Conjunto sin nombre",
    }));
  }, [conjuntos]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormValues(initialFormValues);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    const payload = {
      numero: formValues.numero.trim(),
      tipo: formValues.tipo,
      estado: formValues.estado,
      conjuntoId: formValues.conjuntoId,
    };

    try {
      const result = await createVivienda(payload);
      if (!result?.success) {
        throw result?.error ?? new Error("Error desconocido al crear la vivienda");
      }

      await getViviendas();
      setFeedback({ type: "success", message: "Vivienda registrada correctamente." });
      resetForm();
      if (typeof onSuccess === "function") {
        onSuccess(result.data);
      }
    } catch (error) {
      console.error("Fallo al registrar vivienda:", error);
      setFeedback({
        type: "error",
        message: "No se pudo registrar la vivienda. Verifica la información e intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="register-vivienda-form" onSubmit={handleSubmit}>
      <h3>Registrar nueva vivienda</h3>

      <label>
        Número de vivienda
        <input
          type="text"
          name="numero"
          value={formValues.numero}
          onChange={handleChange}
          required
          placeholder="Ej: A-102"
        />
      </label>

      <label>
        Tipo de vivienda
        <select name="tipo" value={formValues.tipo} onChange={handleChange} required>
          {TIPO_OPCIONES.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </label>

      <label>
        Estado
        <select name="estado" value={formValues.estado} onChange={handleChange} required>
          {ESTADO_OPCIONES.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
      </label>

      <label>
        Conjunto residencial
        <select
          name="conjuntoId"
          value={formValues.conjuntoId}
          onChange={handleChange}
          required
          disabled={loadingConjuntos || !conjuntoOptions.length}
        >
          <option value="" disabled>
            {loadingConjuntos ? "Cargando conjuntos..." : "Selecciona un conjunto"}
          </option>
          {conjuntoOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.nombre}
            </option>
          ))}
        </select>
      </label>

      {feedback.message && (
        <p className={feedback.type === "error" ? "form-feedback-error" : "form-feedback-success"}>
          {feedback.message}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Registrar Vivienda"}
        </button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default RegistrarViviendaForm;
