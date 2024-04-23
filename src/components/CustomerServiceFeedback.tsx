/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppSelector } from "@/app/hooks";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { useCallback, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import axios from "axios";
import { toast } from "./ui/use-toast";
import LoadingButton from "./LoadingButton";

const CustomerServiceFeedback = ({
  serviceName,
  serviceId,
}: {
  serviceName: string;
  serviceId: string;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");
  const [rating, setRating] = useState<number>(1);
  const [open, setOpen] = useState<boolean>(false);

  const customer = useAppSelector((state) => state.authReducer.customer);

  const sendFeedback = useCallback(async () => {
    try {
      if (!(rating && feedback)) return;

      setIsLoading(true);

      const { data } = await axios.post(
        "https://pinaca-0-server.onrender.com/api/feedback/send",
        {
          customerId: customer._id,
          customerName: customer.customerName,
          serviceId,
          rating,
          feedback,
          serviceName,
          date: new Date().toUTCString(),
        }
      );
      console.log(data);
      toast({
        title: "Feedback sent",
        description: data.message,
      });
    } catch (error: any) {
      console.log("Error sending feedback", error);
      toast({
        variant: "destructive",
        title: "Error sending feedback",
        description: error.response.data.message,
      });
    } finally {
      setIsLoading(false);
      setOpen(false);
      setFeedback("");
      setRating(1);
    }
  }, [
    customer._id,
    customer.customerName,
    feedback,
    rating,
    serviceId,
    serviceName,
  ]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant={"primary"} size={"sm"}>
          Give Feedback
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="font-bold">Feedback</DialogTitle>
        <div className="flex flex-col gap-4">
          <p className="text-gray-500">
            <span className="font-bold">Customer Name: </span>
            {customer.customerName}
          </p>
          <p className="text-gray-500">
            <span className="font-bold">Service Name: </span>
            {serviceName}
          </p>
          <div className="flex items-center gap-4">
            <Label>Rating: </Label>
            <Input
              type="number"
              min={1}
              max={10}
              className="w-[70px] h-[30px]"
              value={rating}
              onChange={(e) => setRating(+e.target.value)}
            />
          </div>
          <Textarea
            placeholder="Type your message here."
            rows={7}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          {isLoading ? (
            <LoadingButton />
          ) : (
            <Button variant={"primary"} onClick={sendFeedback}>
              Send feedback
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerServiceFeedback;
