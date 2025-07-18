-- Function to update client counters when appointment status changes
CREATE OR REPLACE FUNCTION update_client_counters()
RETURNS TRIGGER AS $$
BEGIN
  -- If appointment was rescheduled
  IF NEW.status = 'rescheduled' AND OLD.status != 'rescheduled' THEN
    UPDATE clients 
    SET rescheduled_count = rescheduled_count + 1,
        updated_at = now()
    WHERE id = NEW.client_id;
    
    -- Check if client should be deactivated (more than 3 reschedules or 2 cancellations)
    UPDATE clients 
    SET active = false,
        updated_at = now()
    WHERE id = NEW.client_id 
    AND (rescheduled_count >= 3 OR cancelled_count >= 2);
  END IF;
  
  -- If appointment was cancelled
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE clients 
    SET cancelled_count = cancelled_count + 1,
        updated_at = now()
    WHERE id = NEW.client_id;
    
    -- Check if client should be deactivated
    UPDATE clients 
    SET active = false,
        updated_at = now()
    WHERE id = NEW.client_id 
    AND (rescheduled_count >= 3 OR cancelled_count >= 2);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_client_counters
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_client_counters();

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_procedures_updated_at BEFORE UPDATE ON procedures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
