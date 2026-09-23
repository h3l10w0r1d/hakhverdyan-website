// Plain passthrough — kept as a component (rather than inlining every call site)
// so existing usages don't need to change. It used to pull the element toward
// the cursor on hover; that motion was removed site-wide, most noticeably on
// the large CTA buttons where the drag was distracting.
export default function MagnetButton({ as: Tag = "button", className = "", children, strength, ...props }) {
  return (
    <Tag className={className} {...props}>
      {children}
    </Tag>
  );
}
