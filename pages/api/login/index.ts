import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const apiClient = axios.create({
  baseURL: process.env.PICSAL_API_URL ?? "http://127.0.0.1:8000/api/",
});

export default async function loginApi(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res
      .status(403)
      .json({ message: "You have no permission to access this resource." });
    return;
  }

  const { email, password } = req.body ?? {};

  if (!email || !password) {
    res.status(422).json({ error: "Request not allowed." });
    return;
  }

  try {
    const response = await apiClient.post("auth/login/", {
      email,
      password,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      res.status(error.response.status).json(error.response.data);
      return;
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
}
