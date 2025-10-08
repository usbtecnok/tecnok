import type { Request, Response, NextFunction } from "express";

export function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.isAdmin === true) {
    next();
  } else {
    res.status(401).json({ error: "Acesso não autorizado. Faça login como administrador." });
  }
}

export function ensureDriver(req: Request, res: Response, next: NextFunction) {
  if (req.session?.isDriver === true && req.session?.driverId) {
    next();
  } else {
    res.status(401).json({ error: "Acesso não autorizado. Faça login como motorista." });
  }
}
