"""CerebreX Registry API — package publish, install, and search."""

from __future__ import annotations

from ._http import HttpClient
from ._types import Package, PackageListResponse, SuccessResponse


class RegistryClient:
    """Async client for the CerebreX package registry.

    Read operations (search, list, get) are unauthenticated.
    Publish and delete require a valid Bearer token.

    Example:
        async with CerebreXClient(...) as client:
            results = await client.registry.search("web-search")
            for pkg in results.packages:
                print(pkg.name, pkg.version)
    """

    def __init__(self, http: HttpClient) -> None:
        self._http = http

    async def list(
        self,
        query: str = "",
        limit: int = 20,
        offset: int = 0,
    ) -> PackageListResponse:
        """List or search packages in the registry.

        Args:
            query: Optional search string matched against name, description, and tags.
            limit: Max packages to return (default 20).
            offset: Pagination offset.

        Returns:
            PackageListResponse with matching packages.
        """
        params: dict[str, str] = {"limit": str(limit), "offset": str(offset)}
        if query:
            params["q"] = query
        r = await self._http.get("/v1/packages", params=params)
        data = r.json()
        pkgs = [Package.model_validate(p) for p in data.get("packages", [])]
        return PackageListResponse(
            packages=pkgs,
            total=data.get("total", len(pkgs)),
            query=query,
        )

    async def search(self, query: str, limit: int = 20) -> PackageListResponse:
        """Shorthand for list() with a non-empty query.

        Args:
            query: Search string.
            limit: Max results.
        """
        return await self.list(query=query, limit=limit)

    async def get(self, name: str) -> list[Package]:
        """Fetch all published versions of a package.

        Args:
            name: Package name (exact match).

        Returns:
            List of Package objects, one per published version.
        """
        r = await self._http.get(f"/v1/packages/{name}")
        data = r.json()
        return [Package.model_validate(v) for v in data.get("versions", [])]

    async def get_version(self, name: str, version: str) -> Package:
        """Fetch metadata for a specific package version.

        Args:
            name: Package name.
            version: Semver version string.

        Returns:
            Package metadata.
        """
        r = await self._http.get(f"/v1/packages/{name}/{version}")
        return Package.model_validate(r.json())

    async def download_url(self, name: str, version: str) -> str:
        """Return the download URL for a package tarball.

        This does NOT stream the tarball — it returns the URL to fetch it.
        Use httpx or requests to download the binary content separately.

        Args:
            name: Package name.
            version: Semver version string.

        Returns:
            URL string for the tarball download endpoint.
        """
        return f"{self._http._base_url}/v1/packages/{name}/{version}/download"

    async def delete(self, name: str, version: str) -> SuccessResponse:
        """Unpublish a package version (requires admin token).

        Args:
            name: Package name.
            version: Semver version string.
        """
        r = await self._http.delete(f"/v1/packages/{name}/{version}")
        return SuccessResponse.model_validate(r.json())
