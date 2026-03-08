"use client";
import React from "react";
import { Button } from "./ui/button";
import { Trash } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

type Props = {
  seriesId: string;
};

const DeleteButton = ({ seriesId }: Props) => {
  const router = useRouter();
  const deleteSeries = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/api/deleteSeries", {
        seriesId,
      });
      return response.data;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return (
    <Button
      variant={"destructive"}
      size="sm"
      disabled={deleteSeries.isLoading}
      onClick={() => {
        const confirm = window.confirm(
          "Are you sure you want to delete this Series and Full Script? This cannot be undone."
        );
        if (!confirm) return;
        deleteSeries.mutate(undefined, {
          onSuccess: () => {
            router.push("/dashboard");
            router.refresh();
          },
          onError: (err) => {
            console.error(err);
          },
        });
      }}
      className={`bg-red-200 hover:bg-red-400 text-white`}
    >
      <Trash />
    </Button>
  );
};

export default DeleteButton;
