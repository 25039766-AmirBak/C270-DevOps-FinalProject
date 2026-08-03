# Amir
# SharePlate Ansible deployment

Jenkins deploys the exact Docker images that passed Trivy. It packages the
commit-tagged images, and this role transfers and loads that archive on the
production host before starting Docker Compose with `--no-build`.

## Required Jenkins credentials

- `production-server-ssh-key`: SSH private key for the production inventory user.
- `ansible-vault-vars`: secret-file credential containing an Ansible
  Vault-encrypted YAML file with the keys shown in
  `vault-variables.example.yml`.
- `ansible-vault-password`: secret-file credential containing only the password
  used to encrypt `ansible-vault-vars`.

The Jenkins job must build the branch containing this Jenkinsfile. Confirm the
checkout line in the console output before troubleshooting Ansible; local or
unpushed changes cannot be used by Jenkins.

Create the encrypted variables file on a trusted machine with Ansible:

```sh
ansible-vault create vault.yml
```

Enter the variable names from `vault-variables.example.yml`, save the encrypted
file, and upload that encrypted file to Jenkins as `ansible-vault-vars`. Upload
the password separately as `ansible-vault-password`.

## Production SSH setup

The inventory currently connects as `root`, so the Jenkins SSH credential must
belong to that account. To facilitate zero-touch automated deployments, host-key 
checking is disabled in both `ansible.cfg` and the `Jenkinsfile` environment variables.

The production host must provide Docker Engine and the Docker Compose v2 plugin
so both `docker` and `docker compose` are available.