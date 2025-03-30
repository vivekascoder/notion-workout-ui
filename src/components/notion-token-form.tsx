"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import { useStore } from "@/lib/state";
import { Client } from "@notionhq/client";
import { toast } from "sonner";

// import { useToast } from "@/hooks/use-toast";

export default function NotionTokenForm() {
  const setup = useStore((state) => state.setup);

  const formik = useFormik({
    initialValues: {
      notionToken: "",
      databaseId: "",
    },
    onSubmit: async (values) => {
      try {
        const pull = await fetch(
          `/api/ping?notionToken=${values.notionToken}&databaseId=${values.databaseId}`
        );
        if (pull.status === 400) {
          throw new Error("Invalid token or database ID");
        }
      } catch (error: any) {
        toast("Invalid values: " + error.message);
        return;
      }
      toast("Setup completed, go to home page.");

      setup(values.notionToken, values.databaseId);
    },
  });

  return (
    <Card className="w-full ">
      <CardHeader>
        <CardTitle>Notion Configuration</CardTitle>
        <CardDescription>
          Enter your Notion API token and database ID to connect your
          application.
        </CardDescription>
      </CardHeader>
      <form onSubmit={formik.handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notion-token">Notion Token</Label>
            <Input
              id="notion-token"
              name="notionToken"
              placeholder="secret_..."
              onChange={formik.handleChange}
              value={formik.values.notionToken}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="database-id">Database ID</Label>
            <Input
              name="databaseId"
              id="database-id"
              placeholder="a1b2c3d4-..."
              onChange={formik.handleChange}
              value={formik.values.databaseId}
              required
            />
          </div>
          <br />
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full cursor-auto">
            Save Configuration
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
