# SharePlate Minikube deployment

The Jenkins stage labelled `minikube-windows` deploys the exact commit-tagged
Docker images that passed Trivy. The Windows agent must run as the same user
that owns the Docker Desktop and Minikube configuration.

## One-time backend secret setup

Run these commands only on the Minikube Windows computer. Never commit the
completed secret file.

```powershell
Copy-Item .\k8s\backend-secrets.example.env .\k8s\backend-secrets.env
notepad .\k8s\backend-secrets.env
kubectl create secret generic backend-secrets `
  --from-env-file=.\k8s\backend-secrets.env `
  --dry-run=client `
  -o yaml | kubectl apply -f -
Remove-Item -LiteralPath .\k8s\backend-secrets.env -Force
kubectl get secret backend-secrets
```

Replace every placeholder before creating the secret. The generated
`backend-secrets.env` path is ignored by Git.

## Agent prerequisites

The `minikube-windows` Jenkins agent must successfully run:

```powershell
docker version
minikube status
kubectl config current-context
kubectl get nodes
```

The current kubectl context must be `minikube`. Jenkins transfers the scanned
image archive to this agent, loads both images into Docker Desktop and
Minikube, applies the manifests with the current commit tag, and waits for both
deployments to finish rolling out.
