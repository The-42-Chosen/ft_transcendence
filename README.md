# ft_transcendence

Walking skeleton pour le moment juste un truc pour faire fonctionner et voir que podman casse rien

#### Conventional Commits

How to categorize your commits depending on changes you've done

> `(feat):` for feature such as new implementation

> `(chore):` for small changes, not full implementations, small changes (not fixes)

> `(fix):` for fixed issues

> `(docs):` add some documentation to the project

> `(style):` aestetic changes

> `(refactor):` restructuring the code

> `(ci):` github actions & hooks

### Branches

Main: branche du rendu du projet mais tout est toujours fonctionnel dessus

Develop: la ou on va passer le plus claire de notre temps, la branche ou on va reunir notre travail au fur et a mesure

### Database

We chose PostgreSQL, in line with two requirements from the subject.

**"The database must have a clear schema and well-defined relations."**     
Our data (users, matches, friendships, tournaments) is inherently relational, which a SQL database expresses naturally through typed tables and foreign key constraints. A NoSQL document store would have
required enforcing these relations in application code instead.     

**"No data corruption or race conditions occur with simultaneous user
actions."**     
Multiple clients connected through WebSockets can trigger writes at the same time. Databases handle this differently. SQLite, for example, uses a database-wide lock: only one write can happen at a time, and concurrent writes must wait or be retried in application code. PostgreSQL solves this natively with MVCC (Multi-Version Concurrency Control): instead of locking, each write creates a new version of the affected rows, and each transaction reads from a consistent snapshot. Writes to different rows never block each other, and conflicts on the same row are resolved at row level. Concurrency safety is therefore guaranteed by the database engine itself.      

### Prometheus and Grafana

#### Prometheus
Prometheus is an open-source tool that pulls metrics from services at a regular interval.

#### Grafana
Grafana is an open-source tool that queries a metrics database (in our case Prometheus) to visualize data. We will produce dashboards to monitor our infrastructure and application metrics from our backend.

#### Exporters
Prometheus pulls the metrics from the different services, but for that it needs the help of "exporters".
An exporter queries a service, translates the result into the Prometheus metrics format, and exposes it for Prometheus. It acts like a sensor placed next to the targeted service.
There are three cases:
* The targeted service natively exposes a `/metrics` page => nothing to do.
* The service does not expose `/metrics` and is a tool not created by our team => run a dedicated exporter container next to it (e.g. postgres-exporter).
* The service does not expose `/metrics` and is coded by our team => most programming languages have a Prometheus client library to expose `/metrics` directly from our code.

#### Node-exporter and cadvisor
Those two exporters are a little bit more specific: 
* Node-exporter => serves information about the host machine as a whole: CPU, RAM, disk space, network, etc.
* cadvisor => produces the same kind of metrics but per container, so we can see the details of each one.

#### Grafana provisioning
By default, everything set up in Grafana is stored inside its own internal database, so it is neither versioned in git nor reproducible on a teammate's machine. To avoid that, we use provisioning: Grafana reads YAML/JSON files at startup that describe the datasources and the dashboards gives a fully configured Grafana.

#### Access
Prometheus and the exporters will only be accessible inside the docker/podman network, with no exterior connection. Grafana, on the other hand, will be exposed through NGINX with HTTPS and will require a login.
