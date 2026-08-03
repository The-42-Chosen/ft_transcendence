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
