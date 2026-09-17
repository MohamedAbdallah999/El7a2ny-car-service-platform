import type { Vehicle, VehicleMake, VehicleModel } from "@car-platform/types";
import { Button, Card, EmptyState, Input, PageHeader, Select, VehicleCard } from "@car-platform/ui-web";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { vehiclesApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

export function MyCarsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [makeId, setMakeId] = useState("");
  const [modelId, setModelId] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [licensePlate, setLicensePlate] = useState("");

  function fetchVehicles() {
    return Promise.all([vehiclesApi.listMine(), vehiclesApi.listMakes()])
      .then(([vehicleResult, makeResult]) => {
        setVehicles(vehicleResult.vehicles);
        setMakes(makeResult.makes);
      })
      .catch((err) => setError(getErrorMessage(err, "Could not load your vehicles.")))
      .finally(() => setIsLoading(false));
  }

  // Reload after a mutation (add/remove): called from event handlers, so
  // setting isLoading synchronously there is fine — only the mount effect
  // below must not update state synchronously.
  function reload() {
    setIsLoading(true);
    fetchVehicles();
  }

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    // Stale `models` briefly remain while a new make's list loads, but the
    // Select is disabled whenever `makeId` is empty, so nothing incorrect
    // is ever selectable.
    if (!makeId) return;
    vehiclesApi.listModels(makeId).then(({ models: list }) => setModels(list));
  }, [makeId]);

  async function handleAddVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!makeId || !modelId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await vehiclesApi.create({ makeId, modelId, year, licensePlate: licensePlate || undefined });
      setIsAdding(false);
      setMakeId("");
      setModelId("");
      setLicensePlate("");
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not add this vehicle."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemove(vehicleId: string) {
    try {
      await vehiclesApi.remove(vehicleId);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not remove this vehicle."));
    }
  }

  return (
    <div className="form-stack" style={{ gap: "1.5rem" }}>
      <div className="spread-row">
        <PageHeader title="My Cars" />
        <Button onClick={() => setIsAdding((v) => !v)}>
          {isAdding ? "Cancel" : "Add a vehicle"}
        </Button>
      </div>

      {error ? (
        <p role="alert" className="ui-field__message ui-field__message--error">
          {error}
        </p>
      ) : null}

      {isAdding ? (
        <Card>
          <form className="form-stack" onSubmit={handleAddVehicle}>
            <Select label="Make" required value={makeId} onChange={(event) => setMakeId(event.target.value)}>
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
              value={modelId}
              disabled={!makeId}
              onChange={(event) => setModelId(event.target.value)}
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
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            />
            <Input
              label="License plate (optional)"
              value={licensePlate}
              onChange={(event) => setLicensePlate(event.target.value)}
            />
            <Button type="submit" loading={isSubmitting}>
              Save vehicle
            </Button>
          </form>
        </Card>
      ) : null}

      {isLoading ? (
        <p className="loading-block">Loading…</p>
      ) : vehicles.length === 0 ? (
        <EmptyState title="No vehicles yet" description="Add your first vehicle to start booking services." />
      ) : (
        <div className="page-grid page-grid--2col">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              make={vehicle.make?.name}
              model={vehicle.model?.name}
              year={vehicle.year}
              metadata={vehicle.licensePlate ?? undefined}
              action={
                <Button size="sm" variant="ghost" onClick={() => handleRemove(vehicle.id)}>
                  Remove
                </Button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
