import { IService } from "@/app/features/services/serviceSlice";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { GrServices } from "react-icons/gr";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { useSocketContext } from "@/context/socketTypes";
import { useAppSelector } from "@/app/hooks";

const TotalServices = () => {
  const { event } = useSocketContext();

  const [open, setOpen] = useState<boolean>(false);
  const [services, setServices] = useState<IService[]>([]);
  const [disabledServices, setDisabledServices] = useState<IService[]>([]);
  const [removedServices, setRemovedServices] = useState<IService[]>([]);

  const totalServices = useAppSelector(
    (state) => state.serviceReducer.allServices.totalServices
  );

  const fetchServices = useCallback(async () => {
    try {
      const { data } = await axios.get(
        "https://pinaca-0-server.onrender.com/api/services/getAllServices/active"
      );
      setServices(data.services);
    } catch (error) {
      console.log("Error fetching services", error);
    }
  }, []);

  const fetchDisabledServices = useCallback(async () => {
    try {
      const { data } = await axios.get(
        "https://pinaca-0-server.onrender.com/api/services/getAllServices/disabled"
      );

      setDisabledServices(data.services);
    } catch (error) {
      console.log("Error fetching services", error);
    }
  }, []);

  const fetchRemovedServices = useCallback(async () => {
    try {
      const { data } = await axios.get(
        "https://pinaca-0-server.onrender.com/api/services/getAllServices/removed"
      );

      setRemovedServices(data.services);
    } catch (error) {
      console.log("Error fetching services", error);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchServices();
      fetchDisabledServices();
      fetchRemovedServices();
    }
  }, [fetchServices, fetchDisabledServices, fetchRemovedServices, open]);

  useEffect(() => {
    if (event.includes("serviceAdded")) {
      fetchServices();
      fetchDisabledServices();
      fetchRemovedServices();
    }
  }, [event, fetchServices, fetchDisabledServices, fetchRemovedServices]);

  return (
    <>
      <div
        className="lg:w-[30%] h-[100px] h-full flex gap-4 items-center rounded-md bg-white py-2 px-4 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex justify-center items-center">
          <GrServices size={24} />
        </div>
        <div>
          <p className="text-4xl font-medium">{totalServices}</p>
          <p className="text-gray-500 text-sm">Total Services</p>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className=" max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Services</DialogTitle>
            <hr className="border border-gray-200" />
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Active services</AccordionTrigger>
                <AccordionContent>
                  {services.length > 0 ? (
                    services.map((service, index) => (
                      <p key={service._id} className="mt-1">
                        {index + 1}. {service.service}
                      </p>
                    ))
                  ) : (
                    <p>There is no active services.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Disabled Service</AccordionTrigger>
                <AccordionContent>
                  {disabledServices.length > 0 ? (
                    disabledServices.map((service, index) => (
                      <p key={service._id} className="mt-1">
                        {index + 1}. {service.service}
                      </p>
                    ))
                  ) : (
                    <p>There is no disabled services.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Removed Services</AccordionTrigger>
                <AccordionContent>
                  {removedServices.length > 0 ? (
                    removedServices.map((service, index) => (
                      <p key={service._id} className="mt-1">
                        {index + 1}. {service.service}
                      </p>
                    ))
                  ) : (
                    <p>There is no removed services.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TotalServices;
