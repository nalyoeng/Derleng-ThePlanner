import { useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
} from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { normalizeRole } from "../../constants/roles";

export default function RoleRoute({
  allowedRoles,
  deniedRedirect,
}) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    const checkRole = async () => {
      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (authError || !authData.user) {
        setStatus("not-logged-in");
        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (!active) return;

      if (profileError || !profile) {
        console.error(
          "Role checking error:",
          profileError
        );

        setStatus("not-logged-in");
        return;
      }

      const role = normalizeRole(profile.role);

      if (allowedRoles.includes(role)) {
        setStatus("allowed");
      } else {
        setStatus("denied");
      }
    };

    checkRole();

    return () => {
      active = false;
    };
  }, [allowedRoles]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Checking account access...
        </p>
      </div>
    );
  }

  if (status === "not-logged-in") {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (status === "denied") {
    return (
      <Navigate
        to={deniedRedirect}
        replace
      />
    );
  }

  return <Outlet />;
}