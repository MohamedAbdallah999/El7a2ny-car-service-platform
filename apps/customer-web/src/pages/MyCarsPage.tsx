import type { Vehicle, VehicleMake, VehicleModel } from "@car-platform/types";
import { Button, Card, EmptyState, Input, Select } from "@car-platform/ui-web";
import { CarFront, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { vehiclesApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

export function MyCarsPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    makeId: "",
    modelId: "",
    year: new Date().getFullYear(),
    trim: "",
    color: "",
    licensePlate: "",
  });

  function fetchVehicles() {
    return Promise.all([vehiclesApi.listMine(), vehiclesApi.listMakes()])
      .then(([vehicleResult, makeResult]) => {
        setVehicles(vehicleResult.vehicles);
        setMakes(makeResult.makes);
      })
      .catch((reason: unknown) =>
        setError(getErrorMessage(reason, "Could not load your vehicles.")),
      )
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    void fetchVehicles();
  }, []);
  useEffect(() => {
    if (!form.makeId) return;
    vehiclesApi
      .listModels(form.makeId)
      .then(({ models: list }) => setModels(list))
      .catch(() => setModels([]));
  }, [form.makeId]);

  function openAddForm() {
    setEditingId(null);
    setForm({
      makeId: "",
      modelId: "",
      year: new Date().getFullYear(),
      trim: "",
      color: "",
      licensePlate: "",
    });
    setModels([]);
    setIsEditing(true);
  }

  function openEditForm(vehicle: Vehicle) {
    setEditingId(vehicle.id);
    setForm({
      makeId: vehicle.makeId,
      modelId: vehicle.modelId,
      year: vehicle.year,
      trim: vehicle.trim ?? "",
      color: vehicle.color ?? "",
      licensePlate: vehicle.licensePlate ?? "",
    });
    setIsEditing(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.makeId || !form.modelId) return;
    setIsSubmitting(true);
    setError(null);
    const payload = {
      ...form,
      trim: form.trim || undefined,
      color: form.color || undefined,
      licensePlate: form.licensePlate || undefined,
    };
    try {
      if (editingId) await vehiclesApi.update(editingId, payload);
      else await vehiclesApi.create(payload);
      setIsEditing(false);
      setEditingId(null);
      setIsLoading(true);
      await fetchVehicles();
    } catch (reason) {
      setError(getErrorMessage(reason, "Could not save this vehicle."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="customer-page cars-page">
      <header className="cars-page__header">
        <h1>My Cars</h1>
        <Button onClick={openAddForm}>+ Add Vehicle</Button>
      </header>
      {error ? (
        <p role="alert" className="ui-field__message ui-field__message--error">
          {error}
        </p>
      ) : null}
      {isEditing ? (
        <Card className="car-form-card">
          <form className="car-form-grid" onSubmit={handleSubmit}>
            <Select
              label="Make"
              required
              value={form.makeId}
              onChange={(event) => {
                setModels([]);
                setForm((current) => ({
                  ...current,
                  makeId: event.target.value,
                  modelId: "",
                }));
              }}
            >
              <option value="">Select a make</option>
              {makes.map((make) => (
                <option key={make.id} value={make.id}>
                  {make.name}
                </option>
              ))}
            </Select>
            <Select
              label="Model"
              required
              value={form.modelId}
              disabled={!form.makeId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  modelId: event.target.value,
                }))
              }
            >
              <option value="">Select a model</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </Select>
            <Input
              label="Year"
              type="number"
              required
              value={form.year}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  year: Number(event.target.value),
                }))
              }
            />
            <Input
              label="Engine / Trim"
              value={form.trim}
              onChange={(event) =>
                setForm((current) => ({ ...current, trim: event.target.value }))
              }
            />
            <Input
              label="Color"
              value={form.color}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  color: event.target.value,
                }))
              }
            />
            <Input
              label="License Plate"
              value={form.licensePlate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  licensePlate: event.target.value,
                }))
              }
            />
            <div className="car-form-actions">
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {editingId ? "Save Changes" : "Save Vehicle"}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
      {isLoading ? (
        <p className="loading-block">Loading…</p>
      ) : vehicles.length === 0 ? (
        <EmptyState
          title="No vehicles yet"
          description="Add your first vehicle to start booking services."
        />
      ) : (
        <div className="cars-grid">
          {vehicles.map((vehicle) => (
            <article className="car-card" key={vehicle.id}>
              <div className="car-card__image">
                {vehicle.imageUrl ? (
                  <img src={vehicle.imageUrl} alt="" />
                ) : (
                  <CarFront size={52} />
                )}
              </div>
              <div className="car-card__body">
                <div className="car-card__title">
                  <h2>
                    {vehicle.make?.name} {vehicle.model?.name}
                  </h2>
                  <span>{vehicle.year}</span>
                </div>
                <p>
                  {[vehicle.trim, vehicle.color].filter(Boolean).join(" · ") ||
                    "Vehicle details"}
                </p>
                <p>{vehicle.licensePlate || "No license plate"}</p>
                <div className="car-card__actions">
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => openEditForm(vehicle)}
                  >
                    Edit
                  </Button>
                  <Button size="xs" onClick={() => navigate("/services")}>
                    Book Service
                  </Button>
                </div>
              </div>
            </article>
          ))}
          <button className="add-car-card" onClick={openAddForm}>
            <Plus size={30} />
            <span>Add New Vehicle</span>
          </button>
        </div>
      )}
    </div>
  );
}
