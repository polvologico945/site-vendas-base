"use client";
import { CatalogImage } from "@/components/catalog-image";
import { useCart } from "@/hooks/use-cart";
import {
  cartTotal,
  MAX_QUANTITY,
  unitPrice,
  reconcileCart,
  cartEntries,
  sameCart,
} from "@/lib/cart";
import dynamic from "next/dynamic";
import { galleryImages } from "@/lib/images/gallery";
import { HeroGallery } from "@/components/hero-gallery";
import site from "@/config/site.json";
import { whatsappUrl } from "@/lib/contact";
import { themeStyle } from "@/lib/theme";
import { Modal } from "@/components/modal";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Instagram,
  Images,
  MapPin,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { loadCatalog } from "@/lib/store";
import { recoveryTarget } from "@/lib/auth/recovery-link";
import type {
  Category,
  Product,
  ProductType,
  StoreSettings,
} from "@/lib/types";

const money = (value: number) =>
  new Intl.NumberFormat(site.locale, {
    style: "currency",
    currency: site.currency,
  }).format(value);
const ProductGallery = dynamic(() =>
  import("@/components/product-gallery").then(
    (module) => module.ProductGallery,
  ),
);

export default function Storefront() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProductType, setSelectedProductType] = useState("all");
  const [query, setQuery] = useState("");
  const { cart, setCart, cartNotice, setCartNotice } = useCart(
    products,
    Boolean(settings),
  );
  const [error, setError] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [demo, setDemo] = useState(false);
  const [flavorProduct, setFlavorProduct] = useState<Product | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState("");
  const [galleryProduct, setGalleryProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (recoveryTarget(new URL(window.location.href))) return;
    let active = true;
    loadCatalog()
      .then((data) => {
        if (!active) return;
        setSettings(data.settings);
        setCategories(data.categories);
        setProductTypes(data.productTypes);
        setProducts(data.products);
        setDemo(data.demo);
      })
      .catch(() => {
        if (active)
          setError("Não foi possível carregar os produtos. Tente novamente.");
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const categoryMatch =
          selectedCategory === "all" || p.category_id === selectedCategory;

        const productTypeMatch =
          selectedProductType === "all" ||
          p.product_type_id === selectedProductType;

        const text =
          `${p.name} ${p.brand ?? ""} ${p.description ?? ""} ${categories.find((c) => c.id === p.category_id)?.name ?? ""}`.toLowerCase();

        return (
          categoryMatch &&
          productTypeMatch &&
          text.includes(query.toLowerCase())
        );
      }),
    [products, categories, selectedCategory, selectedProductType, query],
  );

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartTotal(cart);

  function addToCart(product: Product, flavor?: string) {
    const selected = flavor || null;

    setCart((current) => {
      const existing = current.find(
        (item) => item.id === product.id && item.flavor === selected,
      );

      if (existing) {
        return current.map((item) =>
          item.id === product.id && item.flavor === selected
            ? {
                ...item,
                quantity: Math.min(MAX_QUANTITY, item.quantity + 1),
              }
            : item,
        );
      }

      return [
        ...current,
        {
          ...product,
          quantity: 1,
          flavor: selected,
        },
      ];
    });

    setCheckoutUrl("");
    setCartOpen(true);
  }

  function changeQty(
    id: string,
    flavor: string | null | undefined,
    delta: number,
  ) {
    setCart((current) =>
      current.map((i) =>
        i.id === id && i.flavor === flavor
          ? {
              ...i,
              quantity: Math.max(1, Math.min(MAX_QUANTITY, i.quantity + delta)),
            }
          : i,
      ),
    );
  }

  async function checkout() {
    if (!settings || !cart.length || checkingOut) return;
    setCheckingOut(true);
    setCheckoutUrl("");
    try {
      const data = await loadCatalog(true);
      const current = reconcileCart(cartEntries(cart), data.products);
      setProducts(data.products);
      setSettings(data.settings);
      setCart(current);
      if (!sameCart(cart, current)) {
        setCartNotice(
          "Atualizamos preços ou disponibilidade do seu carrinho. Confira os itens e finalize novamente.",
        );
        return;
      }
      const message = [
        `Olá! Vim pelo catálogo da ${data.settings.store_name} e quero fazer este pedido:`,
        ...current.map(
          (item) =>
            `• ${item.quantity}x ${item.name}${item.brand ? ` — ${item.brand}` : ""}${item.flavor ? ` — Opção: ${item.flavor}` : ""}${unitPrice(item) !== null ? ` (${money((unitPrice(item) ?? 0) * item.quantity)})` : " — valor sob consulta"}`,
        ),
        `Total estimado dos itens com preço: ${money(cartTotal(current))}`,
        "Pode confirmar disponibilidade, opções e forma de pagamento?",
      ].join("\n");
      // Link explícito após a consulta: evita bloqueadores de popup em Safari/iPhone.
      const target = whatsappUrl(data.settings.whatsapp, message);
      if (!target) {
        setCartNotice(
          "A loja ainda não disponibilizou o envio de pedidos. Tente novamente mais tarde.",
        );
        return;
      }
      setCheckoutUrl(target);
      setCartNotice(
        "Pedido conferido. Toque em Enviar pedido para abrir o WhatsApp.",
      );
    } catch {
      setCartNotice(
        "Não conseguimos confirmar preços e estoque. Tente finalizar novamente em instantes.",
      );
    } finally {
      setCheckingOut(false);
    }
  }

  if (error)
    return (
      <main className="loading">
        <div role="alert">
          <h1>Catálogo indisponível no momento</h1>
          <p>{error}</p>
          <button className="primary-button" onClick={() => location.reload()}>
            Tentar novamente
          </button>
        </div>
      </main>
    );
  if (!settings)
    return (
      <div className="loading" role="status">
        Carregando catálogo…
      </div>
    );

  const heroImages = galleryImages(
    settings.hero_image_url || site.cover,
    settings.hero_image_urls,
  );
  const contact = whatsappUrl(settings.whatsapp);

  return (
    <main
      className="storefront"
      style={
        themeStyle(
          settings.primary_color,
          settings.accent_color,
        ) as React.CSSProperties
      }
    >
      <a className="skip-link" href="#produtos">
        Pular para os produtos
      </a>
      <header className="topbar">
        <a className="brand" href="#inicio">
          <CatalogImage
            src={settings.logo_url || site.logo}
            alt={settings.store_name}
          />
          <span>
            <strong>{settings.store_name}</strong>
            <small>Catálogo online</small>
          </span>
        </a>
        <button
          className="cart-button"
          onClick={() => setCartOpen(true)}
          aria-label="Abrir carrinho"
        >
          <ShoppingBag size={21} />
          <span>Carrinho</span>
          {count > 0 && <b>{count}</b>}
        </button>
      </header>

      <HeroGallery key={JSON.stringify(heroImages)} images={heroImages}>
        <div className="hero-content">
          <span className="eyebrow">{site.eyebrow}</span>
          <h1>{site.headline}</h1>
          <p>{settings.tagline}</p>
          <div className="hero-actions">
            <a className="primary-button" href="#produtos">
              Ver produtos <ChevronRight size={18} />
            </a>
            {contact && (
              <a
                className="secondary-button"
                href={contact}
                target="_blank"
                rel="noreferrer"
              >
                Falar no WhatsApp
              </a>
            )}
          </div>
          <div className="trust-row">
            <span>
              <Check size={16} /> Atendimento rápido
            </span>
            <span>
              <Check size={16} />{" "}
              {contact ? "Pedido pelo WhatsApp" : "Catálogo sempre à mão"}
            </span>
          </div>
        </div>
      </HeroGallery>

      {demo && (
        <div className="demo-banner">
          Modelo base pronto para personalizar. Conecte seu projeto e cadastre
          seus produtos no painel.
        </div>
      )}

      <section
        id="produtos"
        className="catalog-section"
        tabIndex={-1}
        aria-labelledby="catalog-title"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow dark">NOSSO CATÁLOGO</span>
            <h2 id="catalog-title">{site.catalogTitle}</h2>
          </div>
          <p>
            Selecione os produtos, monte o carrinho e finalize diretamente com a
            loja.
          </p>
        </div>

        <div className="catalog-tools">
          <div className="search-box">
            <Search size={19} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar produto, marca ou categoria"
              placeholder="Buscar produto, marca ou categoria…"
            />
          </div>

          <div className="catalog-filters">
            <div className="filter-group">
              <span className="filter-label">Categoria</span>

              <div
                className="category-pills"
                role="group"
                aria-label="Filtrar por categoria"
              >
                <button
                  className={selectedCategory === "all" ? "active" : ""}
                  aria-pressed={selectedCategory === "all"}
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedProductType("all");
                  }}
                >
                  Todos
                </button>

                {categories.map((c) => (
                  <button
                    key={c.id}
                    className={selectedCategory === c.id ? "active" : ""}
                    aria-pressed={selectedCategory === c.id}
                    onClick={() => {
                      setSelectedCategory(c.id);
                      setSelectedProductType("all");
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedCategory !== "all" && (
              <div className="filter-group">
                <span className="filter-label">Tipo de produto</span>

                <div
                  className="category-pills"
                  role="group"
                  aria-label="Filtrar por tipo de produto"
                >
                  <button
                    className={selectedProductType === "all" ? "active" : ""}
                    aria-pressed={selectedProductType === "all"}
                    onClick={() => setSelectedProductType("all")}
                  >
                    Todos
                  </button>

                  {productTypes
                    .filter((type) => type.category_id === selectedCategory)
                    .map((type) => (
                      <button
                        key={type.id}
                        aria-pressed={selectedProductType === type.id}
                        className={
                          selectedProductType === type.id ? "active" : ""
                        }
                        onClick={() => setSelectedProductType(type.id)}
                      >
                        {type.name}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <p
          className="catalog-result-count"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {filtered.length}{" "}
          {filtered.length === 1
            ? "produto encontrado"
            : "produtos encontrados"}
        </p>
        <div className="product-grid">
          {filtered.map((product, index) => {
            const images = galleryImages(product.image_url, product.image_urls);
            return (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  {images.length > 1 ? (
                    <button
                      type="button"
                      className="product-gallery-open"
                      aria-haspopup="dialog"
                      aria-label={`Ver ${images.length} fotos de ${product.name}`}
                      onClick={() => setGalleryProduct(product)}
                    >
                      <CatalogImage
                        src={images[0]}
                        alt={product.name}
                        width={640}
                        height={640}
                        loading={index < 2 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : "auto"}
                      />
                      <span className="product-photo-count">
                        <Images size={15} aria-hidden="true" /> {images.length}{" "}
                        fotos
                      </span>
                    </button>
                  ) : (
                    <CatalogImage
                      src={images[0] || settings.logo_url}
                      alt={product.name}
                      width={640}
                      height={640}
                      loading={index < 2 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                    />
                  )}
                  {product.featured && <span className="badge">Destaque</span>}
                  {product.stock_status === "unavailable" && (
                    <span className="stock unavailable">Indisponível</span>
                  )}
                </div>

                <div className="product-body">
                  <span className="brand-name">
                    {product.brand || settings.store_name}
                  </span>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="price-row">
                    <div>
                      {product.promotional_price !== null ? (
                        <>
                          <small>
                            {product.price !== null ? money(product.price) : ""}
                          </small>
                          <strong>{money(product.promotional_price)}</strong>
                        </>
                      ) : product.price !== null ? (
                        <strong>{money(product.price)}</strong>
                      ) : (
                        <strong className="consult">Consulte o valor</strong>
                      )}
                    </div>
                    <button
                      aria-label={`Adicionar ${product.name} ao carrinho`}
                      disabled={product.stock_status === "unavailable"}
                      onClick={() => {
                        if (product.flavors?.length) {
                          setFlavorProduct(product);
                          setSelectedFlavor("");
                        } else {
                          addToCart(product);
                        }
                      }}
                    >
                      <Plus size={18} /> Adicionar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {!filtered.length && (
          <div className="empty-state">
            {products.length ? (
              "Nenhum produto encontrado com esses filtros."
            ) : (
              <>
                <h3>Novidades em breve</h3>
                <p>Estamos preparando nosso catálogo. Volte para conferir.</p>
              </>
            )}
          </div>
        )}
      </section>

      {contact && (
        <section className="contact-strip">
          <div>
            <h2>Precisa de ajuda para escolher?</h2>
            <p>
              Converse com a loja e confirme opções, tamanhos e disponibilidade.
            </p>
          </div>
          <a href={contact} target="_blank" rel="noreferrer">
            Chamar no WhatsApp <ChevronRight size={18} />
          </a>
        </section>
      )}

      <footer>
        <div className="footer-brand">
          <CatalogImage
            src={settings.logo_url || site.logo}
            alt={settings.store_name}
          />
          <div>
            <strong>{settings.store_name}</strong>
            <span>{site.footerTagline}</span>
          </div>
        </div>
        <div className="footer-info">
          {settings.instagram && (
            <a
              href={`https://instagram.com/${settings.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={17} /> @{settings.instagram.replace(/^@/, "")}
            </a>
          )}
          {settings.address && (
            <span>
              <MapPin size={17} /> {settings.address}
            </span>
          )}
        </div>
        <a className="admin-link" href="/admin/login">
          Área administrativa
        </a>
      </footer>

      {galleryProduct && (
        <ProductGallery
          key={galleryProduct.id}
          product={galleryProduct}
          onClose={() => setGalleryProduct(null)}
        />
      )}

      {cartOpen && (
        <Modal
          className="drawer-backdrop"
          label="Carrinho"
          onClose={() => {
            if (!checkingOut) setCartOpen(false);
          }}
        >
          <aside
            className="cart-drawer"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <span>SEU PEDIDO</span>
                <h2>Carrinho</h2>
              </div>
              <button
                aria-label="Fechar carrinho"
                disabled={checkingOut}
                onClick={() => setCartOpen(false)}
              >
                <X />
              </button>
            </div>
            <div className="cart-list">
              {!cart.length && (
                <div className="empty-cart">
                  <ShoppingBag size={38} />
                  <h3>Seu carrinho está vazio</h3>
                  <p>Adicione produtos para enviar o pedido pelo WhatsApp.</p>
                </div>
              )}
              {cart.map((item) => (
                <div
                  className="cart-item"
                  key={`${item.id}-${item.flavor ?? "sem-opção"}`}
                >
                  <div
                    className="cart-thumb"
                    style={{ overflow: "hidden", borderRadius: "6px" }}
                  >
                    <CatalogImage
                      src={
                        galleryImages(item.image_url, item.image_urls)[0] ||
                        settings.logo_url ||
                        "/brand/logo.svg"
                      }
                      alt=""
                      width={60}
                      height={60}
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="cart-info">
                    <strong>{item.name}</strong>
                    <span>{item.brand}</span>

                    {item.flavor && <small>Opção: {item.flavor}</small>}
                    <div className="qty">
                      <button
                        aria-label={`Diminuir quantidade de ${item.name}`}
                        disabled={checkingOut || item.quantity <= 1}
                        onClick={() => {
                          setCheckoutUrl("");
                          changeQty(item.id, item.flavor, -1);
                        }}
                      >
                        <Minus size={15} />
                      </button>
                      <b>{item.quantity}</b>
                      <button
                        aria-label={`Aumentar quantidade de ${item.name}`}
                        disabled={checkingOut || item.quantity >= MAX_QUANTITY}
                        onClick={() => {
                          setCheckoutUrl("");
                          changeQty(item.id, item.flavor, 1);
                        }}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                  <button
                    className="remove"
                    aria-label={`Remover ${item.name}`}
                    disabled={checkingOut}
                    onClick={() => (
                      setCheckoutUrl(""),
                      setCart(
                        cart.filter(
                          (i) =>
                            !(i.id === item.id && i.flavor === item.flavor),
                        ),
                      )
                    )}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <div className="drawer-footer">
              {cartNotice && (
                <p role="status" className="cart-notice">
                  {cartNotice}
                </p>
              )}
              {cart.some((item) => unitPrice(item) !== null) && (
                <div className="total">
                  <span>Total estimado</span>
                  <strong>{money(total)}</strong>
                </div>
              )}
              <button
                className="checkout"
                disabled={!cart.length || checkingOut || !contact}
                onClick={checkout}
              >
                {checkingOut
                  ? "Conferindo preços e estoque…"
                  : "Finalizar pedido"}{" "}
                <ChevronRight size={19} />
              </button>
              {checkoutUrl && (
                <a
                  className="checkout checkout-link"
                  href={checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Enviar pedido pelo WhatsApp <ChevronRight size={19} />
                </a>
              )}
              <small>
                {contact
                  ? "O pedido será enviado à loja para confirmação de estoque e pagamento."
                  : "O envio de pedidos ficará disponível quando a loja configurar seu canal de atendimento."}
              </small>
            </div>
          </aside>
        </Modal>
      )}
      {flavorProduct && (
        <Modal
          className="flavor-modal-backdrop"
          label="Escolher opção"
          onClose={() => setFlavorProduct(null)}
        >
          <div
            className="flavor-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <span>ESCOLHA UMA OPÇÃO</span>
                <h2>{flavorProduct.name}</h2>
              </div>

              <button
                aria-label="Fechar seleção de opção"
                onClick={() => setFlavorProduct(null)}
              >
                <X />
              </button>
            </div>

            <p>Selecione o opção desejado:</p>

            <div className="flavor-options">
              {flavorProduct.flavors?.map((flavor) => (
                <button
                  key={flavor}
                  aria-pressed={selectedFlavor === flavor}
                  className={selectedFlavor === flavor ? "active" : ""}
                  onClick={() => setSelectedFlavor(flavor)}
                >
                  {flavor}
                </button>
              ))}
            </div>

            <button
              className="checkout"
              disabled={!selectedFlavor}
              onClick={() => {
                addToCart(flavorProduct, selectedFlavor);
                setFlavorProduct(null);
                setSelectedFlavor("");
                setCartOpen(true);
              }}
            >
              Adicionar ao carrinho
              <ChevronRight size={19} />
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
